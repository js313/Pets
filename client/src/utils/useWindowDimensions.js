import { useEffect, useState } from "react"

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height }
}

function useWindowDimensions() {
    const [windowSize, setWindowSize] = useState(getWindowDimensions())
    useEffect(() => {
        function handleResize() {
            setWindowSize(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)     //get dimensions whenever resized
        return () => window.removeEventListener('resize', handleResize) //stop getting dimensions when off the page
    }, [])

    return windowSize
}

export default useWindowDimensions