import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { FaImage } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const UpdateUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [fName, setFName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [bFormNo, setBFormNo] = useState('');
    const [studyProgress, setStudyProgress] = useState('');
    const [behaviour, setBehaviour] = useState('');
    const [residenceDuration, setResidenceDuration] = useState('');
    const [image, setImage] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [chosenImage, setChosenImage] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const docRef = doc(db, 'students', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setName(userData.name);
                    setFName(userData.fName);
                    setRegNo(userData.regNo);
                    setBFormNo(userData.bFormNo);
                    setStudyProgress(userData.studyProgress);
                    setBehaviour(userData.behaviour);
                    setResidenceDuration(userData.residenceDuration);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [id]);

    const handleProfileDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const docRef = doc(db, 'students', id);
            let downloadUrl = null;

            if (image) {
                const { downloadUrl: imageUrl, fileName } = await uploadImage();
                downloadUrl = imageUrl;
            }

            const userData = {
                name: name,
                fName: fName,
                regNo: regNo,
                bFormNo: bFormNo,
                studyProgress: studyProgress,
                behaviour: behaviour,
                residenceDuration: residenceDuration,
                profileImage: downloadUrl || ''
            };

            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const existingData = docSnap.data();
                let updateNeeded = false;

                for (const key in userData) {
                    if (userData[key] !== existingData[key]) {
                        updateNeeded = true;
                        break;
                    }
                }

                if (updateNeeded) {
                    await updateDoc(docRef, userData);
                    enqueueSnackbar('Document successfully updated!', { variant: 'success' })
                    console.log('Document successfully updated!');
                } else {
                    console.log('No changes detected.');
                }
            } else {
                console.log('No such document!');
            }
            navigate('/allemployees');
        } catch (error) {
            console.error('Error updating profile details:', error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setChosenImage(file ? file.name : '');
    };

    const uploadImage = async () => {
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        const downloadUrl = await getDownloadURL(storageRef);
        return { downloadUrl, fileName: image.name };
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Update User" />

            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Update User Form
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
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => setName(e.target.value)}
                                            value={name}
                                            required
                                            placeholder='Enter Name'
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>

                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Father Name
                                        </label>
                                        <input
                                            type="text"
                                            onChange={(e) => setFName(e.target.value)}
                                            value={fName}
                                            required
                                            placeholder='Enter Father Name'
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Registration No.
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setRegNo(e.target.value)}
                                        value={regNo}
                                        required
                                        placeholder='Enter Registration No.'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        B-Form No.
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setBFormNo(e.target.value)}
                                        value={bFormNo}
                                        placeholder='Enter B-Form No.'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <div className="relative mb-2.5 flex text-black dark:text-white">
                                        <h6 className=" text-[16px]">Profile Image</h6>
                                    </div>
                                    <div className="pb-5 ">
                                        <div className="flex items-center justify-center">
                                            <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary hover:ring-1 hover:ring-[#363636]/30 transition-all ease-in-out">
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
                                        Study Progress
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setStudyProgress(e.target.value)}
                                        value={studyProgress}
                                        required
                                        placeholder='Enter Study Progress'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Behaviour
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setBehaviour(e.target.value)}
                                        value={behaviour}
                                        required
                                        placeholder='Enter Behaviour'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Duration of Residence
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setResidenceDuration(e.target.value)}
                                        value={residenceDuration}
                                        placeholder='Enter Duration of Residence'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                >
                                    {loading ? <Spinner /> : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default UpdateUser;
