import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import DefaultLayout from "../../layout/DefaultLayout";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { FaImage } from "react-icons/fa";
import Spinner from "../Spinner";
import { useSnackbar } from "notistack";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState("");
  const [fName, setFName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [bFormNo, setBFormNo] = useState("");
  const [studyProgress, setStudyProgress] = useState("");
  const [age, setAge] = useState("");
  const [residenceDuration, setResidenceDuration] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [deathCertificateImg, setDeathCertificateImg] = useState(null);
  const [chosenDeathCertificateImg, setChosenDeathCertificateImg] =
    useState(null);
  const [school, setSchool] = useState("");
  const [relation, setRelation] = useState("");
  const [gurdianIdCardImg, setGurdianIdCardImg] = useState(null);
  const [chosenGurdianIdCardImg, setChosenGurdianIdCardImg] = useState(null);
  const [bFormImg, setBFormImg] = useState(null);
  const [chosenBFormImg, setChosenBFormImg] = useState(null);
  const [gurdianPhone, setGurdianPhone] = useState("");
  const [image, setImage] = useState(null);
  const [chosenImage, setChosenImage] = useState(null);
  const [isOptionSelected, setIsOptionSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [studentClass, setStudentClass] = useState("");
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const querySnap = await getDocs(collection(db, "classes"));
        const fetchedClasses = querySnap.docs.map((doc) => ({
          id: doc.id,
          className: doc.data().className || "No name",
        }));

        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const handleClassChange = (e) => {
    const selectedClassId = e.target.value;
    setStudentClass(selectedClassId);

    const selectedClass = classes.find(
      (classItem) => classItem.id === selectedClassId
    );
    if (selectedClass) {
      setClassId(selectedClass.id);
      setClassName(selectedClass.className);
    }
  };

  const handleProfileDetails = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q = query(
        collection(db, "students"),
        where("bFormNo", "==", bFormNo)
      );
      const querySnapshot = await getDocs(q);

      if (name.length < 3) {
        enqueueSnackbar("Name should be more than 3 characters.", {
          variant: "error",
        });
        setLoading(false);
        return;
      }

      if (gurdianPhone.length < 11) {
        enqueueSnackbar("Phone number should be 11 digits", {
          variant: "error",
        });
        setLoading(false);
        return;
      }

      if (bFormNo.length < 13) {
        enqueueSnackbar("B Form number should be 13 digits", {
          variant: "error",
        });
        setLoading(false);
        return;
      }

      if (!querySnapshot.empty) {
        enqueueSnackbar(
          "B-Form No. already exists. Please enter a unique B-Form No.",
          { variant: "error" }
        );
        setLoading(false);
        return;
      }

      if (!classId || !className) {
        enqueueSnackbar("Please select a valid class.", { variant: "error" });
        setLoading(false);
        return;
      }

      const profileImageRef = await uploadImage(image);
      const deathCertificateRef = await uploadImage(chosenDeathCertificateImg);
      const gurdianIdCardRef = await uploadImage(chosenGurdianIdCardImg);
      const bFormRef = await uploadImage(chosenBFormImg);

      await addDoc(collection(db, "students"), {
        name,
        fName,
        regNo,
        bFormNo,
        studyProgress,
        age,
        residenceDuration,
        admissionDate,
        classId,
        studentClass: className,
        school,
        relation,
        gurdianPhone,
        profileImage: profileImageRef,
        deathCertificateImg: deathCertificateRef,
        gurdianIdCardImg: gurdianIdCardRef,
        bFormImg: bFormRef,
      });

      enqueueSnackbar("Document successfully written!", { variant: "success" });

      setName("");
      setFName("");
      setRegNo("");
      setBFormNo("");
      setStudyProgress("");
      setAge("");
      setAdmissionDate("");
      setResidenceDuration("");
      setClassId("");
      setClassName("");
      setSchool("");
      setRelation("");
      setGurdianPhone("");
      setImage(null);
      setChosenDeathCertificateImg(null);
      setChosenGurdianIdCardImg(null);
      setChosenBFormImg(null);

      navigate("/allemployees");
    } catch (error) {
      console.log(error.message);
      enqueueSnackbar("Error storing students details.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (image) => {
    if (!image) return "";

    const storageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  };

  const formatBFormNo = (value) => {
    value = value.replace(/\D/g, "");

    if (value.length > 13) {
      value = value.slice(0, 13);
    }

    if (value.length <= 5) {
      return value;
    } else if (value.length <= 12) {
      return value.slice(0, 5) + "-" + value.slice(5);
    } else {
      return (
        value.slice(0, 5) + "-" + value.slice(5, 12) + "-" + value.slice(12, 13)
      );
    }
  };
  const handleBFormNoChange = (e) => {
    const formattedValue = formatBFormNo(e.target.value);
    setBFormNo(formattedValue);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setAdmissionDate(today);
  }, []);

  const handleDateChange = (e) => {
    setAdmissionDate(e.target.value);
  };

  const handleFileChange = (setter, setterChosen) => (e) => {
    const file = e.target.files[0];
    setter(file);
    setterChosen(file ? file.name : null);
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add New Student" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Student Form
          </h3>
        </div>
        <form encType="multipart/form-data" onSubmit={handleProfileDetails}>
          <div className="p-6.5">
            <div className="mb-2.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const enteredValue = e.target.value.replace(
                      /[^a-zA-Z ]/g,
                      ""
                    );
                    setName(enteredValue);
                  }}
                  value={name}
                  required
                  placeholder="e.g: John"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="w-full xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Father Name
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const enteredValue = e.target.value.replace(
                      /[^a-zA-Z ]/g,
                      ""
                    );
                    setFName(enteredValue);
                  }}
                  value={fName}
                  required
                  placeholder="e.g: Hipon"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Registration No.
                </label>
                <input
                  type="text"
                  onChange={(e) => setRegNo(e.target.value)}
                  value={regNo}
                  required
                  placeholder="e.g: 0000"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  B-Form No.
                </label>
                <input
                  type="text"
                  onChange={handleBFormNoChange}
                  value={bFormNo}
                  required
                  placeholder="e.g: 00000-0000000-0"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            <div className="mb-2.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <div className="relative mb-2.5 flex text-black dark:text-white">
                  <h6 className="text-[16px]">Profile Image</h6>
                </div>
                <div className="pb-5">
                  <div className="flex items-center justify-center">
                    <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary hover:ring-1 hover:ring-[#363636]/30 transition-all ease-in-out">
                      <FaImage className="text-xl mb-1 text-[#5F5F5F]" />
                      <span className="text-[#5F5F5F]">
                        {chosenImage || "Choose an image..."}
                      </span>
                      <input
                        type="file"
                        className="opacity-0 w-0 h-0"
                        onChange={handleFileChange(setImage, setChosenImage)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full xl:w-1/2">
                <div className="relative mb-2.5 flex text-black dark:text-white">
                  <h6 className="text-[16px]">BForm Image</h6>
                </div>
                <div className="pb-5">
                  <div className="flex items-center justify-center">
                    <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary hover:ring-1 hover:ring-[#363636]/30 transition-all ease-in-out">
                      <FaImage className="text-xl mb-1 text-[#5F5F5F]" />
                      <span className="text-[#5F5F5F]">
                        {chosenBFormImg || "Choose an image..."}
                      </span>
                      <input
                        type="file"
                        className="opacity-0 w-0 h-0"
                        onChange={handleFileChange(
                          setBFormImg,
                          setChosenBFormImg
                        )}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full xl:w-1/2">
                <div className="relative flex mb-2.5 text-black dark:text-white">
                  <h6 className="text-[16px]">
                    Father Death Certificate Image
                  </h6>
                </div>
                <div className="pb-5">
                  <div className="flex items-center justify-center">
                    <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary hover:ring-1 hover:ring-[#363636]/30 transition-all ease-in-out">
                      <FaImage className="text-xl mb-1 text-[#5F5F5F]" />
                      <span className="text-[#5F5F5F]">
                        {chosenDeathCertificateImg || "Choose an image..."}
                      </span>
                      <input
                        type="file"
                        className="opacity-0 w-0 h-0"
                        onChange={handleFileChange(
                          setDeathCertificateImg,
                          setChosenDeathCertificateImg
                        )}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-2.5 flex flex-col gap-6 xl:flex-row">
              {/* <div className="mb-2.5 xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Study Progress
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const enteredValue = e.target.value.replace(
                      /[^a-zA-Z]/g,
                      ""
                    );
                    setStudyProgress(enteredValue);
                  }}
                  value={studyProgress}
                  required
                  placeholder="Enter Study Progress"
                  className="w-full mb-4.5 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}
            </div>
            <div className="mb-2.5 flex flex-col gap-6 xl:flex-row">
              {/* <div className="mb-4.5 xl:w-1/4">
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
                            </div> */}
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Admission Date
                </label>
                <input
                  type="date"
                  onChange={handleDateChange}
                  value={admissionDate}
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              {/* <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Duration of Residence
                </label>
                <input
                  type="text"
                  onChange={(e) => setResidenceDuration(e.target.value)}
                  value={residenceDuration}
                  required
                  placeholder="Enter Duration of Residence"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div> */}
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  {" "}
                  Gurdian Relation{" "}
                </label>

                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    onChange={(e) => setRelation(e.target.value)}
                    value={relation}
                    required
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                      isOptionSelected ? "text-black dark:text-white" : ""
                    }`}
                  >
                    <option
                      value=""
                      disabled
                      className="text-body dark:text-bodydark"
                    >
                      Relations
                    </option>
                    <option
                      value="Khaliqia Government School"
                      className="text-body dark:text-bodydark"
                    >
                      Mother
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Brother
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Grand Father
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Grand Mother
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Uncle
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Aunt
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Cousin
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Friend
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Other
                    </option>
                  </select>

                  <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                          fill=""
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
              </div>

              {/* <input
                  type="text"
                  value={relation}
                  onChange={(e) => {
                    const enteredValue = e.target.value.replace(
                      /[^a-zA-Z]/g,
                      ""
                    );
                    setRelation(enteredValue);
                  }}
                  required
                  placeholder="Enter gurdian relation"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                /> */}
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Gurdian Phone No.
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const enteredValue = e.target.value.replace(/\D/g, "");
                    setGurdianPhone(enteredValue);
                  }}
                  value={gurdianPhone}
                  required
                  placeholder="e.g: 0300 0000000"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5 xl:w-1/4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Student Age
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const enteredValue = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 2);
                    setAge(enteredValue);
                  }}
                  value={age}
                  required
                  placeholder="e.g: 12"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            <div className="mb-2.5 flex flex-col gap-6 xl:flex-row">
              <div className="mb-4.5 xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  {" "}
                  Select Class{" "}
                </label>

                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    onChange={handleClassChange}
                    value={studentClass}
                    required
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                      isOptionSelected ? "text-black dark:text-white" : ""
                    }`}
                  >
                    <option value="" disabled>
                      Classes
                    </option>
                    {classes.length > 0 ? (
                      classes.map((cls, index) => (
                        <option key={index} value={cls.id}>
                          {cls.className}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No classes available.
                      </option>
                    )}
                  </select>
                  <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                          fill=""
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
              </div>
              <div className="mb-4.5 xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  {" "}
                  Select School{" "}
                </label>

                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    onChange={(e) => setSchool(e.target.value)}
                    value={school}
                    required
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                      isOptionSelected ? "text-black dark:text-white" : ""
                    }`}
                  >
                    <option
                      value=""
                      disabled
                      className="text-body dark:text-bodydark"
                    >
                      Schools
                    </option>
                    <option
                      value="Khaliqia Government School"
                      className="text-body dark:text-bodydark"
                    >
                      Khaliqia Government School
                    </option>
                    <option
                      value="Khaliqia Government Higher Secondary School"
                      className="text-body dark:text-bodydark"
                    >
                      Khaliqia Government Higher Secondary School
                    </option>
                  </select>

                  <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                          fill=""
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full mb-4.5">
              <div className="relative flex mb-2.5 text-black dark:text-white">
                <h6 className="text-[16px]">Gurdian ID Card Image</h6>
              </div>
              <div className="pb-5">
                <div className="flex items-center justify-center">
                  <label className="w-full flex gap-3 items-center rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 focus-within:ring-2 text-white cursor-pointer focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary hover:ring-1 hover:ring-[#363636]/30 transition-all ease-in-out">
                    <FaImage className="text-xl mb-1 text-[#5F5F5F]" />
                    <span className="text-[#5F5F5F]">
                      {chosenGurdianIdCardImg || "Choose an image..."}
                    </span>
                    <input
                      type="file"
                      className="opacity-0 w-0 h-0"
                      onChange={handleFileChange(
                        setGurdianIdCardImg,
                        setChosenGurdianIdCardImg
                      )}
                    />
                  </label>
                </div>
              </div>
            </div>
            <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
              {loading ? <Spinner /> : " Onboard Student"}
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default AddEmployee;
