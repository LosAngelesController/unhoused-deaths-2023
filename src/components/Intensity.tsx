import * as React from "react";

interface IntensityProps {
  normalizeIntensity: boolean;
  setNormalizeIntensity: any;
}

export function Intensity(props: IntensityProps) {
  return (
    <div className="mt-2">
      <input
        onChange={(e) => {
          props.setNormalizeIntensity(e.target.checked);
        }}
        className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
        type="checkbox"
        id="flexCheckChecked"
        checked={props.normalizeIntensity}
      />
      <label
        className="form-check-label inline-block text-gray-100"
        htmlFor="flexCheckChecked"
      >
        Normalize Intensity
      </label>
    </div>
  );
}
