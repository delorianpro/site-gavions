type CameraSceneProps = {
  background: "gate" | "park" | "ware" | "recep" | "site";
  figure?: "person" | "car" | "truck";
  figureClassName?: string;
  figureTransform?: string;
  "aria-hidden"?: "true" | "false";
};

export function CameraScene({
  background,
  figure,
  figureClassName,
  figureTransform,
  "aria-hidden": ariaHidden,
}: CameraSceneProps) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden={ariaHidden}>
      <use href={`#bg-${background}`} />
      {figure && <use href={`#fig-${figure}`} className={figureClassName} transform={figureTransform} />}
    </svg>
  );
}
