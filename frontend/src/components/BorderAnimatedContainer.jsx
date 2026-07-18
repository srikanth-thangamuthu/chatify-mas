// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(45deg,#07111f,#071a2d_50%,#07111f)_padding-box,conic-gradient(from_var(--border-angle),rgba(45,212,191,0.16)_70%,rgba(56,189,248,0.9)_82%,rgba(45,212,191,0.16)_98%)_border-box] rounded-2xl border border-transparent animate-border flex overflow-hidden">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
