import ActiveLink from "./ActiveLink";

const navigationPayroll = [
  {
    name: "41.18",
    url: "/",
    newtab: true,
  },
  {
    name: "LA Controller",
    url: "https://controller.lacity.gov",
    newtab: true,
  },
  {
    name: "Table",
    url: "https://docs.google.com/spreadsheets/d/1p7PNhgu0kKiRdeXnOUNOfYNzLmP7D6Iq1TTspxIaF_c/edit?usp=sharing",
    newtab: true,
  }
];

function Nav() {
  const messageBox = () => {
    alert(
      "-Click & Drag to explore locations on the map, or enter a location in the Search bar.\n\n-Click on a map point to view arrest details by location.\n\n-Click Filter button to view by Race, Year, Council District, Arrest Type, and Time."
    );
  };

  return (
    <div className="z-50 bg-[#1a1a1a] flex flex-col">
      <nav className="z-50 flex flex-row  h-content">
        {navigationPayroll.map((item: any, itemIdx: any) => (
          <ActiveLink
            activeClassName="text-white py-2 md:py-3 px-6 block hover:text-green-300 focus:outline-none text-green-300 border-b-2 font-medium border-green-300"
            href={item.url}
            key={itemIdx}
            target={`${item.newtab === true ? "_blank" : ""}`}
          >
            <p className="text-white py-2 text-sm md:text-base   md:py-3 px-3 block hover:text-green-300 focus:outline-none underline">
              {item.name}
            </p>
          </ActiveLink>
        ))}
        <p
          className="text-white py-2 text-sm md:text-base   md:py-3 px-3 block hover:text-green-300 focus:outline-none underline"
          onClick={messageBox}
        >
          Instructions
        </p>
      </nav>
    </div>
  );
}

export default Nav;
