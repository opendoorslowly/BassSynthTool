import Knob from "./Knob";

export default function Effects() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Knob 
        label="Delay Time"
        onChange={(v) => updateParameter("delayTime", v)}
        defaultValue={0.3}
        min={0}
        max={1}
      />
      <Knob
        label="Delay FB"
        onChange={(v) => updateParameter("delayFeedback", v)}
        defaultValue={0.3}
        min={0}
        max={0.9}
      />
      <Knob
        label="Reverb"
        onChange={(v) => updateParameter("reverbDecay", v)}
        defaultValue={0.2}
        min={0}
        max={1}
      />
      <Knob
        label="Pitch"
        onChange={(v) => updateParameter("pitch", v)}
        defaultValue={0.5}
        min={0}
        max={1}
      />
    </div>
  );
}
