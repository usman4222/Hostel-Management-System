import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';
import { FaImage } from 'react-icons/fa';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const AddAd = () => {
    const [link, setLink] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [existingAdId, setExistingAdId] = useState(null);
    const [chosenImage, setChosenImage] = useState(null);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'ad'));
                if (!querySnapshot.empty) {
                    const adDoc = querySnapshot.docs[0];
                    setLink(adDoc.data().link);
                    setExistingAdId(adDoc.id);
                }
            } catch (error) {
                console.error('Error fetching ad:', error);
            }
        };

        fetchAd();
    }, []);

    const handleAddAd = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (existingAdId) {
                const adDocRef = doc(db, 'ad', existingAdId);
                const imageRef = await uploadImage();
                await updateDoc(adDocRef, {
                    link: link,
                    blogImage: imageRef,
                });
                enqueueSnackbar('Ad Link updated successfully!', { variant: 'success' });
            } else {
                await addDoc(collection(db, 'ad'), {
                    link: link,
                });
                enqueueSnackbar('Ad Link added successfully!', { variant: 'success' });
            }

            setLink('');
            setLoading(false);
        } catch (error) {
            console.error('Error adding/updating ad:', error);
            setLoading(false);
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

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add New Ad" />

            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Ad Form
                            </h3>
                        </div>
                        <form onSubmit={handleAddAd}>
                            <div className="p-6.5">
                                <div className="w-full pb-5">
                                    <label className="mb-2.5 mt-4 block text-black dark:text-white">
                                        Link
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) => setLink(e.target.value)}
                                        value={link}
                                        required
                                        placeholder='Enter Ad Link'
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    />
                                </div>
                                {/* <div className="mb-10">
                                    <label className="mb-2.5 mt-4 block text-black dark:text-white">
                                        Add Banner
                                    </label>
                                    <div className="flex items-center">
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
                                </div> */}
                                <button
                                    type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner /> : existingAdId ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default AddAd;
