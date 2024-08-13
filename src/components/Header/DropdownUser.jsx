import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserOne from '../../images/logo/sor.png';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  function logoutUser() {
    localStorage.removeItem('adminId');
    enqueueSnackbar('Logout Successfully...!', { variant: 'success' });
    navigate('/sign-in');

  }
  const trigger = useRef(null);
  const dropdown = useRef(null);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
          </span>
          <span className="block text-xs">Hostel Management System</span>
        </span>

        <span className="h-7 w-7 flex justify-center items-center rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" id="hotel">
            <path fill="none" d="M0 0h24v24H0V0z"></path>
            <path fill="#007bff" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-6c-1.1 0-2 .9-2 2v5H3V6c0-.55-.45-1-1-1s-1 .45-1 1v13c0 .55.45 1 1 1s1-.45 1-1v-2h18v2c0 .55.45 1 1 1s1-.45 1-1v-8c0-2.21-1.79-4-4-4z"></path>
          </svg>
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${dropdownOpen === true ? 'block' : 'hidden'
          }`}
      >
        <ul className="flex flex-col gap-5 px-6 py-7.5">
          <li>
            <Link
              onClick={logoutUser}
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.4551 15.8646L12.8527 14.2622L15.7262 11.3887H6.9873V10.1128H15.7262L12.8527 7.23926L14.4551 5.63684L20.5846 11.7663L14.4551 17.8958L12.8527 16.2934L15.7262 13.4199H6.9873V14.6958H15.7262L12.8527 17.5694L14.4551 15.9646V15.8646ZM1.99975 1.5H11.2365V3.1914H1.99975C1.35755 3.1914 0.841797 3.70715 0.841797 4.34935V17.6214C0.841797 18.2636 1.35755 18.7794 1.99975 18.7794H11.2365V20.4708H1.99975C0.906172 20.4708 0 19.5646 0 18.471V4.49935C0 3.40578 0.906172 2.4996 1.99975 2.4996H11.2365V4.34935H1.99975V1.5Z"
                  fill=""
                />
              </svg>
              <span>Log out</span>
            </Link>
          </li>
        </ul>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;
