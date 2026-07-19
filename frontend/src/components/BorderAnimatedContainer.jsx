// How to make animated gradient border 👇
// https://cruip-tutorials.vercel.app/animated-gradient-border/
function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(45deg,#081519_50%,#081519)_padding-box,conic-gradient(from_var(--border-angle),rgba(68,78,85,0.65)_80%,#27313a_86%,#27313a_90%,#27313a_94%,rgba(68,78,85,0.65))_border-box] rounded-2xl border border-transparent animate-border flex overflow-hidden">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;
