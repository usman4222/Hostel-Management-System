import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CoverOne from '../images/cover/cover-01.png';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { FaPhoneAlt } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { CSVLink } from 'react-csv';
import { useSnackbar } from 'notistack';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReferrals, setShowReferrals] = useState(false);
  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'profiles', id));
        if (userDoc.exists()) setUser(userDoc.data());

        const q = query(collection(db, 'profiles'), where('referrerID', '==', id));
        const querySnapshot = await getDocs(q);
        const referralsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReferrals(referralsList);
        setTotalReferrals(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDeleteReferral = async (referralId) => {
    try {
      const referralDoc = doc(db, 'profiles', referralId);
      const referralSnapshot = await getDoc(referralDoc);
      if (!referralSnapshot.exists()) {
        console.error('Referral not found');
        return;
      }

      await updateDoc(referralDoc, {
        referrerID: '',
        referralByCode: '',
      });

      setTotalReferrals((prev) => prev - 1);
      setReferrals((prev) => prev.filter((referral) => referral.id !== referralId));
      enqueueSnackbar('Referral deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting referral:', error);
    }
  };

  const hourlyRate = 0.14 * (totalReferrals * 1.1);

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

  // CSV export functionality
  const headers = [
    { label: 'First Name', key: 'firstName' },
    { label: 'Surname', key: 'surname' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Referral Code', key: 'referralCode' },
    { label: 'Referral By Code', key: 'referralByCode' },
    { label: 'Coins', key: 'coins' },
  ];

  const csvData = [
    {
      firstName: user.firstName,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      referralCode: user.referralCode,
      referralByCode: user.referralByCode,
      coins: user.coins,
    },
    ...referrals.map((referral) => ({
      firstName: referral.firstName,
      surname: referral.surname,
      phone: referral.phone,
      referralCode: referral.referralCode,
    })),
  ];

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Profile" />
      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img src={CoverOne} alt="profile cover" className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center" />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative overflow-hidden z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2">
              <img src={user.profileImage} className="bg-white rounded-full" alt="profile" />
            </div>
          </div>
          <h4 className="mt-2 text-md font-semibold text-black dark:text-white">{user.fullName}</h4>
          <p className="text-sm">{user.role}</p>
          <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">{user.firstName} {user.surname}</h3>
          <div className='flex justify-center items-center gap-2'>
            <FaPhoneAlt /> <p className="font-medium">{user.phone}</p>
          </div>
          <div className="mx-auto mt-4.5 mb-5.5 grid max-w-[800px] grid-cols-4 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
            <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="font-semibold text-black dark:text-white">{user.referralCode}</span>
              <span className="text-sm">Referral Code</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="font-semibold text-black dark:text-white">{user.referralByCode}</span>
              <span className="text-sm">Referral By Code</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="font-semibold text-black dark:text-white">{hourlyRate.toFixed(2)}</span>
              <span className="text-sm"> Mining rate</span>
            </div>
            <div className='flex items-center justify-center'>
              <button onClick={() => setShowReferrals(!showReferrals)}>
                <div className='flex items-center'>
                  <span className="font-semibold text-black dark:text-white">{totalReferrals}</span>
                  <span className="text-sm ml-2">Total Referrals</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        {showReferrals && (
          <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
            <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">Referral Details</h4>
            {referrals.length === 0 ? (
              <p className='flex justify-center items-center'>No referrals found.</p>
            ) : (
              referrals.map((referral, index) => (
                <div key={index} className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4">
                  <div className="relative h-14 w-14 rounded-full">
                    <img src={referral.profileImage} alt="User" className='rounded-full' />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div>
                      <h5 className="font-medium text-black dark:text-white">{referral.firstName}</h5>
                      <p><span className="text-sm text-black dark:text-white">{referral.surname}</span></p>
                    </div>
                    <button className="hover:text-primary" onClick={() => handleDeleteReferral(referral.id)}>
                      <MdDeleteForever />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center mt-4">
        <CSVLink
          data={csvData}
          headers={headers}
          filename={`user_${user.firstName}_${user.surname}_referrals.csv`}
          className="bg-primary text-white rounded px-4 py-2 shadow hover:bg-opacity-90"
        >
          Export User & Referrals Data (CSV)
        </CSVLink>
        {totalReferrals > 0 && (
          <p className="text-sm mt-2 text-gray-500">Including {totalReferrals} referral(s)</p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Profile;
