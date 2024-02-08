import { useEffect, useRef, useState } from 'react'
import "./scann.css"
import { useSpinner } from '../../context/SpinnerContext';

const Scann = () => {

    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    //creating a usestate for storing the photo
    const [photo, setPhoto] = useState<string | null>(null)

    //making usestate for openning of camera
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(true)

    //making a USESTATE for DISPLYING the RECOGNISED face DETAILS
    const [recognisedDetails, setRecognisedDetails] = useState<{ name: string, status: string, gender: string, email: string }>()

    //making USESTATE for display the details
    const [displyDetails, setDisplayDetails] = useState<boolean>(false)

    //making a USESTATE for recognise user is NOT REGISTERED
    const [isUserRegister, setIsUserRegister] = useState<{ status: boolean, message: string }>({ status: true, message: "" })

    const { setSpinnerState
    } = useSpinner()

    const handleScann = async () => {

        setSpinnerState(true)

        // creating AITOKEN for storing the response of FACE PLUS PLUS
        let aiToken: string = ""

        try {
            //creating the image
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Capture the photo as a data URL
                    const dataUrl = canvas.toDataURL('image/png');

                    // updating the image in useState
                    setPhoto(dataUrl)

                    const binaryData = atob(dataUrl.split(',')[1]);
                    const byteArray = new Uint8Array(binaryData.length);
                    for (let i = 0; i < binaryData.length; i++) {
                        byteArray[i] = binaryData.charCodeAt(i);
                    }

                    // Create a Blob from the binary data
                    const blob = new Blob([byteArray], { type: 'image/png' });

                    const formData = new FormData()
                    formData.append("blob", blob);

                    // making to POST request to backend to take the current imgage FACETOKEN
                    try {
                        const request = await fetch(`${process.env.REACT_APP_PORT_URI}api/faceapp/detectimg`, {
                            method: "POST",
                            body: formData
                        })
                        const response = await request.json()
                        if (response.success === true) {
                            aiToken = response.airesponse.faceToken
                        }
                    } catch (error) {
                        setSpinnerState(false)
                        console.log("take picture backend error", error)
                    }
                }
            }
            //making a request to backend for COMPARING the tokens of users
            try {
                const request = await fetch(`${process.env.REACT_APP_PORT_URI}api/faceapp/recog`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        aiToken: aiToken
                    })
                })
                const response = await request.json()
                if (response.success === true) {
                    setRecognisedDetails({
                        name: response.matchUser.name,
                        gender: response.matchUser.gender,
                        status: response.matchUser.status,
                        email: response.matchUser.email,
                    })
                }
                else {
                    setIsUserRegister({
                        status: response.success,
                        message: response.message
                    })
                }

                setDisplayDetails(true)
            } catch (error) {
                console.log("Error in comparing the face token")
            }

            setSpinnerState(false)
        } catch (error) {
            console.log("Handle scann error")
            setSpinnerState(false)
        }
    }

    const handleOk = () => {
        setDisplayDetails(false)
        setPhoto(null)
        setIsCameraOpen(false)

    }

    useEffect(() => {
        const videoStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                })
                setCameraStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.log("Video stream not working", error)
            }
        }
        videoStream()
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [isCameraOpen])

    return (
        <div className='scann_container'>
            <div className="scann_options">
                {displyDetails === false ?
                    <div className="scann_content">
                        <div className="scann_camera">
                            {photo === null ? (<><video className='scann_video' ref={videoRef} autoPlay playsInline />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                            </>) : (<img src={photo} alt="" />)}
                        </div>
                        <div className="scann_btn">
                            <button onClick={() => handleScann()}>Scann</button>
                        </div>
                    </div>
                    : <div className='scann_details'>
                        <div className="scann_details_info">
                            {isUserRegister.status === false ? <div className='scann_no_user'>
                                <p>{isUserRegister.message}</p>
                            </div> :
                                <div className='scann_data'>
                                    <p>Name : {recognisedDetails?.name}</p>
                                    <p>Status : {recognisedDetails?.status}</p>
                                    <p>Gender : {recognisedDetails?.gender}</p>
                                    <p>Email : {recognisedDetails?.email}</p>
                                </div>}
                        </div>
                        <div className="scann_details_button">
                            <button onClick={() => handleOk()}>OK</button>
                        </div>
                    </div>}
            </div>
        </div>
    )
}

export default Scann
