// import { useEffect } from 'react';
// import { collection, getDocs, query } from 'firebase/firestore';
// import { db } from '../firebase'; 

// const FetchedClasses = ({ setClasses }) => {
//     useEffect(() => {
//         const fetchClasses = async () => {
//             try {
//                 const q = query(collection(db, 'classes'));
//                 const querySnapshot = await getDocs(q);

//                 if (querySnapshot.empty) {
//                     console.log('No classes found');
//                     return;
//                 }

//                 const classesList = querySnapshot.docs.map(doc => doc.data().className || 'No name');
//                 console.log('Fetched classes:', classesList);
//                 setClasses(classesList);  
//             } catch (error) {
//                 console.error('Error fetching classes:', error);
//             }
//         };

//         fetchClasses();
//     }, [setClasses]);

//     return null;  
// };

// export default FetchedClasses;
import React, { useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

const FetchedClasses = ({ setClasses }) => {
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const q = query(collection(db, 'classes'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log('No classes found');
                    return;
                }

                const classesList = querySnapshot.docs.map(doc => ({
                    id: doc.id, 
                    className: doc.data().className || 'No name'
                }));

                console.log('Fetched classes:', classesList);
                setClasses(classesList);  
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        fetchClasses();
    }, [setClasses]);

    return null;  
};

export default FetchedClasses;

