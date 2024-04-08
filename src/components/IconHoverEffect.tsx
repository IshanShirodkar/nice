import { ReactNode } from "react"
import { useDarkMode } from "~/styles/darkModeContext"

type IconHoverEffectProps = {
    children: ReactNode,
    red?: boolean
}

export function IconHoverEffect ({children, red = false}: IconHoverEffectProps) {
    const { darkMode } = useDarkMode();
    const colorClasses = darkMode ? "outline-gray-900 hover:bg-gray-900 group-hover:bg-gray-900 group-focus-visible:bg-gray-900 focus-visible:bg-gray-900" : "outline-gray-400 hover:bg-gray-200 group-hover:bg-gray-200 group-focus-visible:bg-gray-200 focus-visible:bg-gray-200"

    return <div className = {`rounded-full p-2 transition-colors duration-200 ${colorClasses}`}>
        {children}
    </div>
}