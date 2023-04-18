import React from "react";

export function CaseTypes(props: any) {

  return (
    <>
      <div className="my-2">
        <p className="text-xs text-[#41ffca]">
          <strong>Click on Case Type for more info:</strong>
        </p>
        <ul className="text-xs cursor-pointer">
          <li className="my-1" onClick={props.onCaseClicked}>
            FRP
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            GENERAL
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            CITATIONS
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            PACE
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            BILLBOARDS
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            VEIP
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            SIGNS
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            CNAP
          </li>
          <li className="my-1" onClick={props.onCaseClicked}>
            NAR
          </li>
        </ul>
      </div>
    </>
  );
}
