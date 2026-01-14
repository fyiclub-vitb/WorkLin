import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
const Spinner = ({ size = "md", color = "currentColor", className }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-4",
        lg: "w-12 h-12 border-4",
    };
    return (_jsx("div", { className: cn("flex justify-center items-center", className), children: _jsx(motion.div, { animate: { rotate: 360 }, transition: {
                repeat: Infinity,
                duration: 1,
                ease: "linear",
            }, className: cn("rounded-full border-t-transparent", sizeClasses[size], className), style: { borderColor: color === "currentColor" ? undefined : color, borderTopColor: "transparent" } }) }));
};
export default Spinner;
