import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { FaImage } from 'react-icons/fa';

const AddEmployee = () => {


    const navigate = useNavigate();

    const [Fname, setFname] = useState('');
    const [surName, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [phone, setPhone] = useState('');
    const [refBy, setRefBy] = useState('');
    const [refCode, setRefCode] = useState('');
    const [image, setImage] = useState(null);
    const [chosenImage, setChosenImage] = useState(null);
    const [referralCodeExists, setReferralCodeExists] = useState(false);
    const [referrerID, setReferrerID] = useState(null);

    const handleProfileDetails = async (e) => {
        e.preventDefault();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        try {

            if (!emailPattern.test(email)) {
                throw new Error('Invalid email format.');
            }

            const emailQuerySnapshot = await getDocs(query(collection(db, 'profiles'), where('email', '==', email)));
            if (!emailQuerySnapshot.empty) {
                throw new Error('Email already exists');
            }

            const refCodeQuerySnapshot = await getDocs(query(collection(db, 'profiles'), where('referralCode', '==', refCode)));
            if (!refCodeQuerySnapshot.empty) {
                throw new Error('Referral code already exists');
            }

            if (refBy && !referralCodeExists) {
                alert('Friend Referral code does not exist');
                return;
            }

            const imageRef = await uploadImage();
            await addDoc(collection(db, 'profiles'), {
                email: email,
                firstName: Fname,
                surname: surName,
                pin: pin,
                phone: phone,
                referralByCode: refBy,
                referralCode: refCode,
                imageUrl: imageRef,
                referrerID: referrerID
            });
            console.log("Document successfully written!");

            setFname('');
            setSurname('');
            setEmail('');
            setPin('');
            setPhone('');
            setRefBy('');
            setRefCode('');
            setChosenImage(null);

            navigate('/allemployees');
        } catch (error) {
            console.error('Error storing profile details:', error);
            if (error.message === 'Email already exists') {
                alert('Email already exists');
            } else if (error.message === 'Referral code already exists') {
                alert('Referral code already exists');
            }
            else if ("Invalid email format.") {
                alert("Invalid email format.")
            } else {
                console.log(error.message, "Other errors");
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setChosenImage(file ? file.name : null);
    };

    const uploadImage = async () => {
        if (!image) return '';

        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
    };

    const checkReferralCode = async () => {
        if (!refBy) return;

        const refCodeQuerySnapshot = await getDocs(query(collection(db, 'profiles'), where('referralCode', '==', refBy)));
        if (refCodeQuerySnapshot.empty) {
            setReferralCodeExists(false);
            setReferrerID(null);
            alert('Friend Referral code does not exist');
        } else {
            setReferralCodeExists(true);
            const doc = refCodeQuerySnapshot.docs[0];
            setReferrerID(doc.id);
        }
    };





    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add New User" />

            <div className=" flex justify-center items-center ">
                <div className="flex flex-col ">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                User Form
                            </h3>
                        </div>
                        <form
                            encType='multipart/form-data'
                            onSubmit={handleProfileDetails}
                        >
                            <div className="p-6.5">
                                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => setFname(e.target.value)}
                                            value={Fname}
                                            required
                                            placeholder='Enter Your First Name'
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>

                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Surname
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => setSurname(e.target.value)}
                                            value={surName}
                                            required
                                            placeholder='Enter Your Surname'
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Email
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                        required
                                        placeholder='Enter Your Email'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <div className="relative mb-2.5 flex text-black dark:text-white">
                                        <h6 className=" text-[16px]">Profile Image</h6>
                                    </div>
                                    <div className="pb-5 ">
                                        <div className="flex items-center justify-center">
                                            <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary  focus-within:ring-[#CE9600] hover:ring-2 hover:ring-[#363636]/30 transition-all ease-in-out">
                                                <FaImage className="text-xl mb-1 text-[#5F5F5F]" />
                                                <span className="text-[#5F5F5F]">
                                                    {chosenImage || 'Choose an image...'}
                                                </span>
                                                <input
                                                    type="file"
                                                    className="opacity-0 w-0 h-0"
                                                    onClick={(e) => e.target.value = null}
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Pin
                                    </label>
                                    <input
                                        type="password"
                                        onChange={(e) => setPin(e.target.value)}
                                        value={pin}
                                        required
                                        placeholder='Enter Your Pin'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => {
                                            const enteredValue = e.target.value.replace(/\D/g, '');
                                            setPhone(enteredValue);
                                        }}
                                        value={phone}
                                        required
                                        placeholder='Enter Your Phone No.'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        If User Referred by a friend? (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setRefBy(e.target.value)}
                                        value={refBy}
                                        placeholder='Enter your referral code here'
                                        onBlur={checkReferralCode}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        User's Referral Code
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setRefCode(e.target.value)}
                                        value={refCode}
                                        required
                                        placeholder='Enter your custom referral code here'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={refBy && !referralCodeExists}
                                    style={{ cursor: refBy && !referralCodeExists ? 'not-allowed' : 'pointer' }} className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AddEmployee;
