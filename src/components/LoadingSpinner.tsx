import { VscRefresh } from "react-icons/vsc"

type LoadingSpinnerProps = {
    big: boolean,
}


export function LoadingSpinner ({big = false}: LoadingSpinnerProps) {
    const sizeClasses = big ? "w-16 h-16" : "w-8 h-8"

    return <div>
        <VscRefresh className={`animate-spin ${sizeClasses}`}/>
    </div>
}