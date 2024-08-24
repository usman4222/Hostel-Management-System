import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, query, collection, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useSnackbar } from 'notistack';
import Spinner from '../Spinner';

const UpdateExam = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examTerm, setExamTerm] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [obtainedMarks, setObtainedMarks] = useState('');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const docRef = doc(db, 'exams', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const examData = docSnap.data();
                    setSelectedClass(examData.classId || '');
                    setSelectedStudent(examData.studentId || '');
                    setSelectedSubject(examData.subject || '');
                    setExamTerm(examData.examTerm || '');
                    setTotalMarks(examData.totalMarks || '');
                    setObtainedMarks(examData.obtainedMarks || '');

                    const classDoc = await getDoc(doc(db, 'classes', examData.classId));
                    if (classDoc.exists()) {
                        setClassName(classDoc.data().className);
                    }

                    const studentDoc = await getDoc(doc(db, 'students', examData.studentId));
                    if (studentDoc.exists()) {
                        setStudentName(studentDoc.data().name);
                    }
                } else {
                    console.error("No such exam!");
                }
            } catch (error) {
                console.error('Error fetching exam:', error);
            }
            setLoading(false);
        };

        fetchExam();
    }, [id]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedClass) return;

            try {
                const q = query(collection(db, 'students'), where('classId', '==', selectedClass));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No students found for this class.");
                } else {
                    const studentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentsList);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [selectedClass]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const q = query(collection(db, 'classes'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log("No classes found.");
                } else {
                    const classesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClasses(classesList);
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        fetchClasses();
    }, []);

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setClassName(''); 
    };

    const handleStudentChange = (e) => {
        setSelectedStudent(e.target.value);
        const student = students.find(s => s.id === e.target.value);
        if (student) setStudentName(student.name);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    const handleExamTermChange = (e) => {
        setExamTerm(e.target.value);
    };

    const handleTotalMarksChange = (e) => {
        setTotalMarks(e.target.value);
    };

    const handleObtainedMarksChange = (e) => {
        setObtainedMarks(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedClass || !selectedStudent || !selectedSubject || !examTerm || !totalMarks || !obtainedMarks) {
            console.error("All fields are required");
            return;
        }

        setSubmitLoading(true);

        try {
            const docRef = doc(db, 'exams', id);
            await updateDoc(docRef, {
                classId: selectedClass,
                studentId: selectedStudent,
                subject: selectedSubject,
                examTerm: examTerm,
                totalMarks: parseFloat(totalMarks),
                obtainedMarks: parseFloat(obtainedMarks),
            });
            enqueueSnackbar("Exam updated successfully!", { variant: 'success' });
            navigate('/all-exams');  
        } catch (error) {
            console.error("Error updating exam:", error);
            enqueueSnackbar("Error updating exam. Please try again.", { variant: 'error' });
        }

        setSubmitLoading(false);
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Update Exam" />
            <div className="flex justify-center items-center">
                <div className="flex flex-col">
                    <div className="rounded-sm md:w-[500px] border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Update Exam
                            </h3>
                        </div>
                        {loading ? (
                            <div className="p-6.5 flex justify-center items-center">
                                <Spinner />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-6.5">
                                    <div className="mb-4.5 ">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Exam Term
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <input
                                                type="text"
                                                value={examTerm}
                                                disabled
                                                className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Class Name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <input
                                                type="text"
                                                value={className}
                                                disabled
                                                className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Student Name
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <input
                                                type="text"
                                                value={studentName}
                                                disabled
                                                className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition dark:border-form-strokedark dark:bg-form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Select Class
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                required
                                                onChange={handleClassChange}
                                                value={selectedClass}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            >
                                                <option value="">
                                                    Select your class
                                                </option>
                                                {classes.length > 0 ? (
                                                    classes.map((cls, index) => (
                                                        <option key={index} value={cls.id}>
                                                            {cls.className}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No classes available</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Select Student
                                        </label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                required
                                                onChange={handleStudentChange}
                                                value={selectedStudent}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            >
                                                <option value="">
                                                    Select your student
                                                </option>
                                                {students.length > 0 ? (
                                                    students.map((student, index) => (
                                                        <option key={index} value={student.id}>
                                                            {student.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No students available</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={selectedSubject}
                                            onChange={handleSubjectChange}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            placeholder="Enter subject"
                                        />
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Total Marks
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={totalMarks}
                                            onChange={handleTotalMarksChange}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            placeholder="Enter total marks"
                                        />
                                    </div>

                                    <div className="mb-4.5">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Obtained Marks
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={obtainedMarks}
                                            onChange={handleObtainedMarksChange}
                                            className="w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            placeholder="Enter obtained marks"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="inline-flex w-full justify-center rounded bg-primary py-3 px-5 text-base font-medium text-white transition hover:bg-opacity-90"
                                    >
                                        {submitLoading ? "Updating..." : "Update Exam"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default UpdateExam;
