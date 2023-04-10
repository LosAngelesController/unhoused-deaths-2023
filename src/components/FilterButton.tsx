import * as React from "react";

export function FilterButton(props: any) {
  return (
    <div className="flex flex-row">
      <button
        onClick={() => {
          props.setfilterpanelopened(true);
        }}
        className={`md:block mt-2 rounded-full px-3 pb-1.5 pt-0.5 text-sm bold md:text-base 
        bg-gray-800 bg-opacity-80 text-white border-white border-2`}
      >
        <svg
          style={{
            width: "20px",
            height: "20px",
          }}
          viewBox="0 0 24 24"
          className="inline align-middle mt-0.5"
        >
          <path
            fill="currentColor"
            d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"
          />
        </svg>
        <span>Filter</span>
      </button>
    </div>
  );
}
