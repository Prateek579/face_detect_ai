import { useSpinner } from "../../context/SpinnerContext";
import "./create.css"
import React, { useEffect, useRef, useState, ChangeEvent } from "react"

const Create = () => {

    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    //importing from spinnerContext
    const { setSpinnerState, setTaskCompleted
    } = useSpinner()

    //creating a usestate for storing the photo
    const [photo, setPhoto] = useState<string | null>(null)

    // creating a USESTATE for again opening of camera after it display the image
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(true)

    // creating USESTATE for storing the respose of AI and USER INPUT details
    const [aiDetails, setAiDetails] = useState<{ faceToken: string, gender: string }>({ faceToken: "0", gender: "undefined" })
    const [userDetails, setUserDetails] = useState<{ name: string, status: string, email: string }>({ name: "", status: "", email: "" })

    const takePicture = async () => {
        setSpinnerState(true)
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

                try {
                    const request = await fetch(`${process.env.REACT_APP_PORT_URI}api/faceapp/detectimg`, {
                        method: "POST",
                        body: formData
                    })
                    const response = await request.json()
                    setSpinnerState(false)
                    if (response.success === true) {
                        setAiDetails({
                            faceToken: response.airesponse.faceToken,
                            gender: response.airesponse.gender
                        })
                    }
                } catch (error) {
                    setSpinnerState(false)
                    console.log("take picture backend error", error)
                }
            }
        }
    }

    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        setUserDetails({
            ...userDetails,
            [e.target.name]: e.target.value
        })

    }

    // making POST request to backend for storing the data
    const handleSave = async () => {
        setSpinnerState(true)
        const { name, status, email } = userDetails;
        const { faceToken, gender } = aiDetails
        if (userDetails.name !== "" || userDetails.email !== "" || userDetails.status !== "") {
            try {
                const request = await fetch("http://localhost:8039/api/faceapp/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, status, email, faceToken, gender })
                })
                const response = await request.json()
                if (response) {
                    setSpinnerState(false)
                    setTaskCompleted(true)
                    setIsCameraOpen(false)
                }
            } catch (error) {
                console.log("Handle save error", error)
                setSpinnerState(false)
            }
        }
        else {
            setSpinnerState(false)
        }
        setUserDetails({
            name: "",
            status: "",
            email: ""
        })
        setPhoto(null)
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
        <div className='create_container'>
            <div className="create_content">
                <div className="create_left">
                    <div className="create_camera">
                        {photo === null ? (<><video ref={videoRef} autoPlay playsInline />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </>) : (<img src={photo} alt="" />)}
                    </div>
                    <div className="create_button">
                        <button onClick={takePicture}>Take Picture</button>
                    </div>
                </div>
                <div className="create_right">
                    <div className="create_info">
                        <div className="create_name info">
                            <input type="text" placeholder="Your name" name="name" value={userDetails.name} onChange={handleInput} />
                        </div>
                        <div className="create_place info">
                            <input type="text" placeholder="Your status" name="status" value={userDetails.status} onChange={handleInput} />
                        </div>
                        <div className="create_email info">
                            <input type="email" placeholder="Enter your email" name="email" value={userDetails.email} onChange={handleInput} />
                        </div>
                        <p className="create_mendatory">
                            All field are mandatory
                        </p>
                    </div>
                    <div className="create_button btn">
                        <button onClick={() => handleSave()}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default Create;