import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const AddAd = () => {
    const [link, setLink] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [existingAdId, setExistingAdId] = useState(null);

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
                await updateDoc(adDocRef, {
                    link: link,
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
