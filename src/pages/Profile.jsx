import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CoverOne from '../images/cover/cover-01.png';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { FaPhoneAlt } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';
import { useSnackbar } from 'notistack';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const fetchUser = async () => {
    try {
      const docRef = doc(db, 'students', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser({ ...docSnap.data(), id: docSnap.id });
      } else {
        enqueueSnackbar('No such user found!', { variant: 'error' });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user: ", error);
      enqueueSnackbar('Error fetching user data.', { variant: 'error' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Profile" />
        <div className="text-center">
          <h4 className="mb-6 text-md font-semibold text-black dark:text-white">Loading...</h4>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Profile" />
        <div className="text-center">
          <h4 className="mb-6 text-md font-semibold text-black dark:text-white">No user data found.</h4>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Profile" />
      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img src={CoverOne} alt="profile cover" className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center" />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11">
          <div className="relative overflow-hidden z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2">
              {user.profileImage ? (
                <img src={user.profileImage} className="bg-white rounded-full" alt="profile" />
              ) : (
                <FaUserCircle size={128} color="white" className="bg-gray-300 rounded-full" />
              )}
            </div>
          </div>
          <h4 className="mt-2 text-md font-semibold text-black dark:text-white">{user.name}</h4>
          <p className="text-sm">{user.email}</p>
          <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">{user.phone}</h3>
          <div className='flex justify-center items-center gap-2'>
            <FaPhoneAlt /> <p className="font-medium">{user.phone}</p>
          </div>
          <div className="mx-auto mt-4.5 mb-5.5 grid max-w-[800px] grid-cols-4 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
            <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="font-semibold text-black dark:text-white">{user.referralCode || 'N/A'}</span>
              <span className="text-sm">Referral Code</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="font-semibold text-black dark:text-white">{user.referralByCode || 'N/A'}</span>
              <span className="text-sm">Referral By Code</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="font-semibold text-black dark:text-white">{user.hourlyRate || 'N/A'}</span>
              <span className="text-sm">Mining Rate</span>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
