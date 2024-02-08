import loader from './spinner.gif'
import task from './verified.gif'
import "./spinner.css"
import { useSpinner } from '../../context/SpinnerContext'
import { useEffect} from 'react'

const Spinner = () => {

    const { spinnerState, taskCompleted, setTaskCompleted
    } = useSpinner()


    const disply = () => {
        if (taskCompleted === true) {
            setTimeout(() => {
                setTaskCompleted(false)
            }, 2000)
        }
    }

    useEffect(() => {
        disply()
    }, [taskCompleted])

    return (
        <div className={`spinner_container ${taskCompleted || spinnerState === true ? "display" : "block"}`}>
            {spinnerState === true &&
                <img src={loader} alt="Loading" className='spinner_img' />
            }{taskCompleted === true && <img src={task} alt='task completed' className='spinner_task' />}
        </div>
    )
}

export default Spinner
