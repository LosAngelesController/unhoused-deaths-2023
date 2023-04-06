import * as React from "react";

interface onClickReqs {
  onSelect: any;
  onUnselect: any;
  onInvert: any;
  overrideButtonClass?: string;
}

export function SelectButtons(props: onClickReqs) {
  return (
    <div className="flex flex-row gap-x-1">
      <button
        className="align-middle bg-gray-800 rounded-lg px-1  border border-gray-400 text-sm md:text-base"
        onClick={props.onSelect}
      >
        Select All
      </button>
      <button
        className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base border border-gray-400"
        onClick={props.onUnselect}
      >
        Unselect All
      </button>
      <button
        onClick={props.onInvert}
        className="align-middle bg-gray-800 rounded-lg px-1 text-sm md:text-base  border border-gray-400"
      >
        Invert
      </button>
    </div>
  );
}
