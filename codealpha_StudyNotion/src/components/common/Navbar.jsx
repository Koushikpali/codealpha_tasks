import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";
import { RiArrowDownSFill } from "react-icons/ri";

import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropDown";

const Navbar = () => {
  const NavElements = NavbarLinks;
  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        console.log("res is",res)
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    })();
  }, []);

  const matchRoute = (route) => matchPath({ path: route }, location.pathname);

  return (
    <div className={`flex h-14 items-center justify-center border-b border-richblack-700 bg-richblack-800`}>
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavElements.map((elements, index) => (
              <li key={index} className="relative group">
                {elements.title.toLowerCase() === "catalog" ? (
                  <>
                    <p className="flex items-center gap-1 cursor-pointer">
                      Catalog <RiArrowDownSFill />
                    </p>
                    <div className="invisible absolute left-0 top-full mt-2 w-48 rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 z-20 group-hover:visible group-hover:opacity-100">
                      {loading ? (
                        <p className="text-center">Loading...</p>
                      ) : subLinks.length > 0 ? (
                        subLinks
                          .filter((s) => s.courses?.length > 0)
                          .map((s, i) => (
                            <Link
                              key={i}
                              to={`/catalog/${s.name.split(" ").join("-").toLowerCase()}`}
                              className="block rounded-lg py-2 px-2 hover:bg-richblack-50"
                            >
                              {s.name}
                            </Link>
                          ))
                      ) : (
                        <p className="text-center">No Courses Found</p>
                      )}
                    </div>
                  </>
                ) : (
                  <Link to={elements.path}>
                    <p
                      className={`${
                        matchRoute(elements.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {elements.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login / Signup / Cart / Profile */}
        <div className="hidden items-center gap-x-4 md:flex">
          {/* Cart */}
          {user && user.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-richblack-600 text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Login / Signup */}
          {token === null ? (
            <>
              <Link to="/login">
                <button className="rounded-md border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-md border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100">
                  Sign up
                </button>
              </Link>
            </>
          ) : (
            <ProfileDropdown />
          )}
        </div>

        {/* Mobile Menu */}
        <button className="mr-4 md:hidden">
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
