import { useReveal } from "../experience.jsx";
export default function BlockRevealText({ children, as: Tag = "h2", className = "", delay = 0 }) {
  const reveal = useReveal();
  return <Tag ref={reveal.ref} className={`${className} ${reveal.className}`} style={{ transitionDelay: `${delay}s` }}>{children}</Tag>;
}
