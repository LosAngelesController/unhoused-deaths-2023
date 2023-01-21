import ActiveLink from "./ActiveLink";
const navigationPayroll = [
  {
    name: "Map",
    url: "/",
  },
  /*
  {
    name: "Charts",
    url: "/charts",
    newtab: true,
  },*/
  {
    name: "Los Angeles Controller",
    url: "https://controller.lacity.gov",
    newtab: true,
  },
];

function Nav() {
  return (
    <div className="z-50 bg-[#1a1a1a] flex flex-col">
      <nav className="z-50 flex flex-row  h-content">
        {navigationPayroll.map((item: any, itemIdx: any) => (
          <ActiveLink
            activeClassName="text-white  py-2  md:py-3 px-6 block hover:text-green-300 focus:outline-none text-green-300 border-b-2 font-medium border-green-300"
            href={item.url}
            key={itemIdx}
          >
            <a
              className="text-white py-2 text-sm md:text-base   md:py-3 px-6 block hover:text-green-300 focus:outline-none underline"
              target={`${item.newtab === true ? "_blank" : ""}`}
            >
              {item.name}
            </a>
          </ActiveLink>
        ))}
      </nav>
    </div>
  );
}

export default Nav;
