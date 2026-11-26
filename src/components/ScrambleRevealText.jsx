import { useReveal } from "../experience.jsx";
export default function ScrambleRevealText({ children, as: Tag = "h2", className = "" }) {
  const reveal = useReveal();
  return <Tag ref={reveal.ref} className={`${className} ${reveal.className}`}>{children}</Tag>;
}
