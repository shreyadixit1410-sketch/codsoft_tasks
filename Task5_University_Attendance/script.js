"use strict";

/*
    CAMPUS ATTEND
    University Attendance Management App

    Features:
    - Registration
    - Login
    - Student / Instructor roles
    - Course management
    - Student roster
    - Attendance marking
    - Attendance statistics
    - Local persistent storage
    - Basic password hashing
    - Input validation
    - Error handling
*/


/* =========================================================
   DATABASE
========================================================= */

const DB_KEY = "campusAttendDatabase";

const defaultDatabase = {
    users: [],
    courses: [],
    enrollments: [],
    attendance: []
};


function loadDatabase() {

    try {

        const saved = localStorage.getItem(DB_KEY);

        if (!saved) {
            localStorage.setItem(
                DB_KEY,
                JSON.stringify(defaultDatabase)
            );

            return structuredClone(defaultDatabase);
        }

        const database = JSON.parse(saved);

        return {
            users: Array.isArray(database.users)
                ? database.users
                : [],

            courses: Array.isArray(database.courses)
                ? database.courses
                : [],

            enrollments: Array.isArray(database.enrollments)
                ? database.enrollments
                : [],

            attendance: Array.isArray(database.attendance)
                ? database.attendance
                : []
        };

    } catch (error) {

        console.error(error);

        showToast(
            "Database could not be loaded."
        );

        return structuredClone(defaultDatabase);
    }
}


let database = loadDatabase();


function saveDatabase() {

    try {

        localStorage.setItem(
            DB_KEY,
            JSON.stringify(database)
        );

        return true;

    } catch (error) {

        console.error(error);

        showToast(
            "Could not save data."
        );

        return false;
    }
}


/* =========================================================
   SESSION
========================================================= */

let currentUser = null;


function loadSession() {

    const userId =
        sessionStorage.getItem("campusAttendUser");

    if (!userId) {
        return;
    }

    const user = database.users.find(
        item => item.id === userId
    );

    if (user) {
        currentUser = user;
    }
}


loadSession();


/* =========================================================
   DOM ELEMENTS
========================================================= */

const authPage =
    document.getElementById("authPage");

const appPage =
    document.getElementById("appPage");

const loginBox =
    document.getElementById("loginBox");

const registerBox =
    document.getElementById("registerBox");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const authMessage =
    document.getElementById("authMessage");

const showRegisterBtn =
    document.getElementById("showRegister");

const showLoginBtn =
    document.getElementById("showLogin");

const logoutBtn =
    document.getElementById("logoutBtn");

const toast =
    document.getElementById("toast");


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function generateId(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


function today() {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


function showAuthMessage(message, type = "error") {

    authMessage.textContent = message;

    authMessage.className =
        `message ${type}`;

}


function clearAuthMessage() {

    authMessage.textContent = "";

    authMessage.className = "message";
}


/* =========================================================
   PASSWORD HASHING
========================================================= */

async function hashPassword(password) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(password);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}


/* =========================================================
   AUTH UI
========================================================= */

showRegisterBtn.addEventListener(
    "click",
    () => {

        loginBox.classList.add("hidden");

        registerBox.classList.remove("hidden");

        clearAuthMessage();
    }
);


showLoginBtn.addEventListener(
    "click",
    () => {

        registerBox.classList.add("hidden");

        loginBox.classList.remove("hidden");

        clearAuthMessage();
    }
);


/* =========================================================
   REGISTER
========================================================= */

registerForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        try {

            const name =
                document
                    .getElementById("registerName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("registerPassword")
                    .value;

            const role =
                document
                    .getElementById("registerRole")
                    .value;


            if (name.length < 2) {

                showAuthMessage(
                    "Please enter a valid name."
                );

                return;
            }


            if (!email.includes("@")) {

                showAuthMessage(
                    "Please enter a valid email."
                );

                return;
            }


            if (password.length < 6) {

                showAuthMessage(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (
                role !== "student" &&
                role !== "instructor"
            ) {

                showAuthMessage(
                    "Please select an account type."
                );

                return;
            }


            const existingUser =
                database.users.find(
                    user =>
                        user.email === email
                );


            if (existingUser) {

                showAuthMessage(
                    "An account with this email already exists."
                );

                return;
            }


            const passwordHash =
                await hashPassword(password);


            const newUser = {

                id: generateId("user"),

                name,

                email,

                passwordHash,

                role,

                createdAt: new Date().toISOString()
            };


            database.users.push(newUser);

            saveDatabase();


            registerForm.reset();

            showAuthMessage(
                "Account created successfully. You can now login.",
                "success"
            );


            setTimeout(() => {

                registerBox.classList.add("hidden");

                loginBox.classList.remove("hidden");

                clearAuthMessage();

            }, 1200);


        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Registration failed. Please try again."
            );
        }
    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        try {

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const user =
                database.users.find(
                    item =>
                        item.email === email
                );


            if (!user) {

                showAuthMessage(
                    "Invalid email or password."
                );

                return;
            }


            const passwordHash =
                await hashPassword(password);


            if (
                passwordHash !==
                user.passwordHash
            ) {

                showAuthMessage(
                    "Invalid email or password."
                );

                return;
            }


            currentUser = user;

            sessionStorage.setItem(
                "campusAttendUser",
                user.id
            );


            loginForm.reset();

            clearAuthMessage();

            showApplication();


        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Login failed. Please try again."
            );
        }
    }
);


/* =========================================================
   SHOW APPLICATION
========================================================= */

function showApplication() {

    if (!currentUser) {
        return;
    }

    authPage.classList.add("hidden");

    appPage.classList.remove("hidden");


    document.getElementById(
        "userName"
    ).textContent = currentUser.name;


    document.getElementById(
        "userRole"
    ).textContent = currentUser.role;


    document.getElementById(
        "userAvatar"
    ).textContent =
        currentUser.name
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "welcomeName"
    ).textContent =
        `Welcome, ${currentUser.name}!`;


    setupRoleNavigation();

    renderDashboard();

    showPage("dashboard");
}


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    () => {

        currentUser = null;

        sessionStorage.removeItem(
            "campusAttendUser"
        );

        appPage.classList.add("hidden");

        authPage.classList.remove("hidden");

        loginBox.classList.remove("hidden");

        registerBox.classList.add("hidden");

        clearAuthMessage();

        showToast("Logged out successfully.");
    }
);


/* =========================================================
   ROLE NAVIGATION
========================================================= */

function setupRoleNavigation() {

    const attendanceNav =
        document.getElementById(
            "attendanceNav"
        );

    const studentsNav =
        document.getElementById(
            "studentsNav"
        );

    const addCourseBtn =
        document.getElementById(
            "addCourseBtn"
        );

    const addStudentBtn =
        document.getElementById(
            "addStudentBtn"
        );


    if (currentUser.role === "student") {

        studentsNav.classList.add("hidden");

        addCourseBtn.classList.add("hidden");

        addStudentBtn.classList.add("hidden");

        attendanceNav.classList.remove("hidden");

    } else {

        studentsNav.classList.remove("hidden");

        addCourseBtn.classList.remove("hidden");

        addStudentBtn.classList.remove("hidden");

        attendanceNav.classList.remove("hidden");
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );


navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            showPage(page);
        }
    );
});


function showPage(page) {

    const pages =
        document.querySelectorAll(
            ".page-section"
        );


    pages.forEach(section => {

        section.classList.add("hidden");
    });


    const target =
        document.getElementById(
            `${page}Page`
        );


    if (target) {
        target.classList.remove("hidden");
    }


    navButtons.forEach(button => {

        button.classList.remove("active");

        if (
            button.dataset.page === page
        ) {

            button.classList.add("active");
        }
    });


    const titles = {

        dashboard: [
            "Dashboard",
            "University attendance overview"
        ],

        courses: [
            "Courses",
            "View and manage university courses"
        ],

        attendance: [
            "Attendance",
            "Track attendance records"
        ],

        students: [
            "Student Roster",
            "Manage students enrolled in courses"
        ]
    };


    const selected =
        titles[page];


    if (selected) {

        document.getElementById(
            "pageTitle"
        ).textContent = selected[0];

        document.getElementById(
            "pageSubtitle"
        ).textContent = selected[1];
    }


    if (page === "dashboard") {
        renderDashboard();
    }

    if (page === "courses") {
        renderCourses();
    }

    if (page === "attendance") {
        renderAttendance();
    }

    if (page === "students") {
        renderStudents();
    }
}


/* =========================================================
   COURSE HELPERS
========================================================= */

function getUserCourses() {

    if (currentUser.role === "instructor") {

        return database.courses.filter(
            course =>
                course.instructorId ===
                currentUser.id
        );
    }


    const enrolledCourseIds =
        database.enrollments
            .filter(
                enrollment =>
                    enrollment.studentId ===
                    currentUser.id
            )
            .map(
                enrollment =>
                    enrollment.courseId
            );


    return database.courses.filter(
        course =>
            enrolledCourseIds.includes(
                course.id
            )
    );
}


/* =========================================================
   COURSE MODAL
========================================================= */

const courseModal =
    document.getElementById(
        "courseModal"
    );

const courseForm =
    document.getElementById(
        "courseForm"
    );


document.getElementById(
    "addCourseBtn"
).addEventListener(
    "click",
    () => {

        courseModal.classList.remove(
            "hidden"
        );
    }
);


courseForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        if (
            !currentUser ||
            currentUser.role !== "instructor"
        ) {

            showToast(
                "Only instructors can create courses."
            );

            return;
        }


        const name =
            document.getElementById(
                "courseName"
            ).value.trim();

        const code =
            document.getElementById(
                "courseCode"
            ).value.trim().toUpperCase();

        const instructor =
            document.getElementById(
                "courseInstructor"
            ).value.trim();


        if (
            name.length < 2 ||
            code.length < 2 ||
            instructor.length < 2
        ) {

            showToast(
                "Please fill all course fields."
            );

            return;
        }


        const duplicate =
            database.courses.find(
                course =>
                    course.code === code &&
                    course.instructorId ===
                    currentUser.id
            );


        if (duplicate) {

            showToast(
                "You already have a course with this code."
            );

            return;
        }


        const course = {

            id: generateId("course"),

            name,

            code,

            instructor,

            instructorId:
                currentUser.id,

            createdAt:
                new Date().toISOString()
        };


        database.courses.push(course);

        saveDatabase();

        courseForm.reset();

        courseModal.classList.add(
            "hidden"
        );

        renderCourses();

        renderDashboard();

        updateStudentCourseOptions();

        showToast(
            "Course created successfully."
        );
    }
);


/* =========================================================
   RENDER COURSES
========================================================= */

function renderCourses() {

    const container =
        document.getElementById(
            "coursesContainer"
        );


    const courses =
        getUserCourses();


    if (courses.length === 0) {

        container.innerHTML = `
            <div class="content-card">
                <div class="empty-state">
                    No courses available.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        courses.map(course => {

            const studentCount =
                database.enrollments.filter(
                    enrollment =>
                        enrollment.courseId ===
                        course.id
                ).length;


            const deleteButton =
                currentUser.role ===
                "instructor"

                ? `
                    <button
                        class="delete-btn"
                        onclick="deleteCourse('${course.id}')"
                    >
                        Delete
                    </button>
                `

                : "";


            return `
                <div class="course-card">

                    <h3>
                        ${escapeHTML(course.name)}
                    </h3>

                    <div class="course-code">
                        ${escapeHTML(course.code)}
                    </div>

                    <div class="course-instructor">
                        👨‍🏫
                        ${escapeHTML(course.instructor)}
                    </div>

                    <div class="course-footer">

                        <span>
                            👨‍🎓
                            ${studentCount} students
                        </span>

                        ${deleteButton}

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   DELETE COURSE
========================================================= */

window.deleteCourse =
    function(courseId) {

        if (
            currentUser.role !==
            "instructor"
        ) {

            return;
        }


        const course =
            database.courses.find(
                item =>
                    item.id === courseId
            );


        if (!course) {
            return;
        }


        const confirmed =
            confirm(
                `Delete ${course.name}?`
            );


        if (!confirmed) {
            return;
        }


        database.courses =
            database.courses.filter(
                item =>
                    item.id !== courseId
            );


        database.enrollments =
            database.enrollments.filter(
                item =>
                    item.courseId !== courseId
            );


        database.attendance =
            database.attendance.filter(
                item =>
                    item.courseId !== courseId
            );


        saveDatabase();

        renderCourses();

        renderDashboard();

        renderStudents();

        renderAttendance();

        updateStudentCourseOptions();

        showToast(
            "Course deleted."
        );
    };


/* =========================================================
   STUDENT MODAL
========================================================= */

const studentModal =
    document.getElementById(
        "studentModal"
    );

const studentForm =
    document.getElementById(
        "studentForm"
    );


document.getElementById(
    "addStudentBtn"
).addEventListener(
    "click",
    () => {

        updateStudentCourseOptions();

        studentModal.classList.remove(
            "hidden"
        );
    }
);


function updateStudentCourseOptions() {

    const select =
        document.getElementById(
            "studentCourse"
        );


    if (!select) {
        return;
    }


    const courses =
        getUserCourses();


    select.innerHTML =
        `<option value="">
            Select course
        </option>`;


    courses.forEach(course => {

        select.innerHTML += `
            <option value="${course.id}">
                ${escapeHTML(course.code)}
                - ${escapeHTML(course.name)}
            </option>
        `;
    });
}


/* =========================================================
   ADD STUDENT
========================================================= */

studentForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (
            currentUser.role !==
            "instructor"
        ) {

            showToast(
                "Only instructors can manage the roster."
            );

            return;
        }


        const courseId =
            document.getElementById(
                "studentCourse"
            ).value;

        const name =
            document.getElementById(
                "studentName"
            ).value.trim();

        const email =
            document.getElementById(
                "studentEmail"
            ).value.trim().toLowerCase();


        if (
            !courseId ||
            name.length < 2 ||
            !email.includes("@")
        ) {

            showToast(
                "Please enter valid student details."
            );

            return;
        }


        let student =
            database.users.find(
                user =>
                    user.email === email &&
                    user.role === "student"
            );


        if (!student) {

            student = {

                id: generateId("student"),

                name,

                email,

                role: "student",

                passwordHash: "",

                createdAt:
                    new Date().toISOString()
            };

            database.users.push(student);

        } else {

            student.name = name;
        }


        const alreadyEnrolled =
            database.enrollments.some(
                enrollment =>
                    enrollment.courseId ===
                    courseId &&
                    enrollment.studentId ===
                    student.id
            );


        if (alreadyEnrolled) {

            showToast(
                "Student is already enrolled in this course."
            );

            return;
        }


        database.enrollments.push({

            id: generateId("enrollment"),

            courseId,

            studentId:
                student.id,

            enrolledAt:
                new Date().toISOString()
        });


        saveDatabase();

        studentForm.reset();

        studentModal.classList.add(
            "hidden"
        );

        renderStudents();

        renderCourses();

        renderDashboard();

        showToast(
            "Student added successfully."
        );
    }
);


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    const container =
        document.getElementById(
            "studentsContainer"
        );


    if (currentUser.role !== "instructor") {

        container.innerHTML =
            `<div class="content-card">
                <div class="empty-state">
                    Only instructors can view the student roster.
                </div>
            </div>`;

        return;
    }


    const courses =
        getUserCourses();


    if (courses.length === 0) {

        container.innerHTML =
            `<div class="content-card">
                <div class="empty-state">
                    Create a course first.
                </div>
            </div>`;

        return;
    }


    container.innerHTML =
        courses.map(course => {

            const enrollments =
                database.enrollments.filter(
                    enrollment =>
                        enrollment.courseId ===
                        course.id
                );


            const studentRows =
                enrollments.length === 0

                ? `
                    <div class="empty-state">
                        No students enrolled.
                    </div>
                `

                : enrollments.map(
                    enrollment => {

                        const student =
                            database.users.find(
                                user =>
                                    user.id ===
                                    enrollment.studentId
                            );


                        if (!student) {
                            return "";
                        }


                        return `
                            <div class="student-row">

                                <div class="student-details">

                                    <strong>
                                        ${escapeHTML(
                                            student.name
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            student.email
                                        )}
                                    </span>

                                </div>

                                <button
                                    class="delete-btn"
                                    onclick="removeStudent(
                                        '${enrollment.id}'
                                    )"
                                >
                                    Remove
                                </button>

                            </div>
                        `;

                    }
                ).join("");


            return `
                <div class="roster-card">

                    <div class="roster-header">

                        <div>

                            <h3>
                                ${escapeHTML(
                                    course.name
                                )}
                            </h3>

                            <span>
                                ${escapeHTML(
                                    course.code
                                )}
                            </span>

                        </div>

                        <span>
                            ${enrollments.length}
                            students
                        </span>

                    </div>

                    ${studentRows}

                </div>
            `;

        }).join("");
}


/* =========================================================
   REMOVE STUDENT
========================================================= */

window.removeStudent =
    function(enrollmentId) {

        const enrollment =
            database.enrollments.find(
                item =>
                    item.id ===
                    enrollmentId
            );


        if (!enrollment) {
            return;
        }


        const confirmed =
            confirm(
                "Remove this student from the course?"
            );


        if (!confirmed) {
            return;
        }


        database.enrollments =
            database.enrollments.filter(
                item =>
                    item.id !== enrollmentId
            );


        database.attendance =
            database.attendance.filter(
                item =>
                    !(
                        item.courseId ===
                        enrollment.courseId &&
                        item.studentId ===
                        enrollment.studentId
                    )
            );


        saveDatabase();

        renderStudents();

        renderCourses();

        renderDashboard();

        showToast(
            "Student removed."
        );
    };


/* =========================================================
   ATTENDANCE - STUDENT
========================================================= */

function renderStudentAttendance() {

    const container =
        document.getElementById(
            "attendanceContainer"
        );


    const courses =
        getUserCourses();


    if (courses.length === 0) {

        container.innerHTML =
            `<div class="content-card">
                <div class="empty-state">
                    You are not enrolled in any courses yet.
                </div>
            </div>`;

        return;
    }


    let html = "";


    courses.forEach(course => {

        const record =
            database.attendance.find(
                item =>
                    item.courseId ===
                    course.id &&
                    item.studentId ===
                    currentUser.id &&
                    item.date === today()
            );


        const status =
            record
                ? record.status
                : "Not Marked";


        html += `

            <div class="content-card" style="margin-bottom:18px">

                <div class="section-heading">

                    <div>

                        <h3>
                            ${escapeHTML(
                                course.name
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                course.code
                            )}
                            • Today: ${today()}
                        </p>

                    </div>

                    <div>

                        ${
                            record

                            ? `
                                <span class="status ${
                                    record.status
                                }">
                                    ${
                                        record.status ===
                                        "present"
                                            ? "Present"
                                            : "Absent"
                                    }
                                </span>
                            `

                            : `
                                <button
                                    class="attendance-btn present-btn"
                                    onclick="markAttendance(
                                        '${course.id}',
                                        'present'
                                    )"
                                >
                                    Mark Present
                                </button>

                                <button
                                    class="attendance-btn absent-btn"
                                    onclick="markAttendance(
                                        '${course.id}',
                                        'absent'
                                    )"
                                >
                                    Mark Absent
                                </button>
                            `
                        }

                    </div>

                </div>

            </div>

        `;
    });


    container.innerHTML = html;
}


/* =========================================================
   ATTENDANCE - INSTRUCTOR
========================================================= */

function renderInstructorAttendance() {

    const container =
        document.getElementById(
            "attendanceContainer"
        );


    const courses =
        getUserCourses();


    if (courses.length === 0) {

        container.innerHTML =
            `<div class="content-card">
                <div class="empty-state">
                    Create a course and add students to manage attendance.
                </div>
            </div>`;

        return;
    }


    courses.forEach(() => {});


    let html = "";


    courses.forEach(course => {

        const enrollments =
            database.enrollments.filter(
                enrollment =>
                    enrollment.courseId ===
                    course.id
            );


        html += `

            <div class="content-card"
                 style="margin-bottom:20px">

                <div class="card-header">

                    <h3>
                        ${escapeHTML(
                            course.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            course.code
                        )}
                        • ${today()}
                    </p>

                </div>

                ${
                    enrollments.length === 0

                    ? `
                        <div class="empty-state">
                            No students enrolled.
                        </div>
                    `

                    : `
                        <table class="attendance-table">

                            <thead>

                                <tr>
                                    <th>Student</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                ${enrollments.map(
                                    enrollment => {

                                        const student =
                                            database.users.find(
                                                user =>
                                                    user.id ===
                                                    enrollment.studentId
                                            );


                                        if (!student) {
                                            return "";
                                        }


                                        const record =
                                            database.attendance.find(
                                                item =>
                                                    item.courseId ===
                                                    course.id &&
                                                    item.studentId ===
                                                    student.id &&
                                                    item.date ===
                                                    today()
                                            );


                                        const status =
                                            record
                                                ? record.status
                                                : null;


                                        return `

                                            <tr>

                                                <td>
                                                    ${escapeHTML(
                                                        student.name
                                                    )}
                                                    <br>
                                                    <small>
                                                        ${escapeHTML(
                                                            student.email
                                                        )}
                                                    </small>
                                                </td>

                                                <td>

                                                    ${
                                                        status

                                                        ? `
                                                            <span
                                                                class="status ${status}"
                                                            >
                                                                ${
                                                                    status ===
                                                                    "present"
                                                                        ? "Present"
                                                                        : "Absent"
                                                                }
                                                            </span>
                                                        `

                                                        : `
                                                            <span>
                                                                Not Marked
                                                            </span>
                                                        `
                                                    }

                                                </td>

                                                <td>

                                                    <button
                                                        class="attendance-btn present-btn"
                                                        onclick="markStudentAttendance(
                                                            '${course.id}',
                                                            '${student.id}',
                                                            'present'
                                                        )"
                                                    >
                                                        Present
                                                    </button>

                                                    <button
                                                        class="attendance-btn absent-btn"
                                                        onclick="markStudentAttendance(
                                                            '${course.id}',
                                                            '${student.id}',
                                                            'absent'
                                                        )"
                                                    >
                                                        Absent
                                                    </button>

                                                </td>

                                            </tr>

                                        `;
                                    }
                                ).join("")}

                            </tbody>

                        </table>
                    `
                }

            </div>

        `;
    });


    container.innerHTML = html;
}


/* =========================================================
   RENDER ATTENDANCE
========================================================= */

function renderAttendance() {

    if (
        currentUser.role ===
        "student"
    ) {

        renderStudentAttendance();

    } else {

        renderInstructorAttendance();
    }
}


/* =========================================================
   MARK STUDENT ATTENDANCE
========================================================= */

window.markAttendance =
    function(courseId, status) {

        if (
            !currentUser ||
            currentUser.role !==
            "student"
        ) {

            showToast(
                "Only students can mark their attendance."
            );

            return;
        }


        saveAttendance(
            courseId,
            currentUser.id,
            status
        );
    };


window.markStudentAttendance =
    function(
        courseId,
        studentId,
        status
    ) {

        if (
            !currentUser ||
            currentUser.role !==
            "instructor"
        ) {

            showToast(
                "Only instructors can update student attendance."
            );

            return;
        }


        saveAttendance(
            courseId,
            studentId,
            status
        );
    };


function saveAttendance(
    courseId,
    studentId,
    status
) {

    if (
        status !== "present" &&
        status !== "absent"
    ) {

        showToast(
            "Invalid attendance status."
        );

        return;
    }


    const course =
        database.courses.find(
            item =>
                item.id === courseId
        );


    const student =
        database.users.find(
            item =>
                item.id === studentId
        );


    if (!course || !student) {

        showToast(
            "Course or student not found."
        );

        return;
    }


    const date =
        today();


    const existing =
        database.attendance.find(
            item =>
                item.courseId ===
                courseId &&
                item.studentId ===
                studentId &&
                item.date ===
                date
        );


    if (existing) {

        existing.status =
            status;

        existing.updatedAt =
            new Date().toISOString();

    } else {

        database.attendance.push({

            id: generateId(
                "attendance"
            ),

            courseId,

            studentId,

            date,

            status,

            createdAt:
                new Date().toISOString()
        });
    }


    saveDatabase();

    renderAttendance();

    renderDashboard();

    showToast(
        `Attendance marked ${status}.`
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    if (!currentUser) {
        return;
    }


    const courses =
        getUserCourses();


    document.getElementById(
        "totalCourses"
    ).textContent =
        courses.length;


    let records = [];


    if (
        currentUser.role ===
        "student"
    ) {

        records =
            database.attendance.filter(
                record =>
                    record.studentId ===
                    currentUser.id
            );

    } else {

        const courseIds =
            courses.map(
                course =>
                    course.id
            );


        records =
            database.attendance.filter(
                record =>
                    courseIds.includes(
                        record.courseId
                    )
            );
    }


    const present =
        records.filter(
            record =>
                record.status ===
                "present"
        ).length;


    const absent =
        records.filter(
            record =>
                record.status ===
                "absent"
        ).length;


    const total =
        present + absent;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (present / total) *
                100
            );


    document.getElementById(
        "presentCount"
    ).textContent =
        present;


    document.getElementById(
        "absentCount"
    ).textContent =
        absent;


    document.getElementById(
        "attendancePercentage"
    ).textContent =
        `${percentage}%`;


    renderRecentAttendance(
        records
    );
}


/* =========================================================
   RECENT ATTENDANCE
========================================================= */

function renderRecentAttendance(
    records
) {

    const container =
        document.getElementById(
            "recentAttendance"
        );


    const recent =
        [...records]
            .sort(
                (a, b) =>
                    b.date.localeCompare(
                        a.date
                    )
            )
            .slice(0, 8);


    if (recent.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                No attendance records yet.
            </div>`;

        return;
    }


    const rows =
        recent.map(record => {

            const course =
                database.courses.find(
                    item =>
                        item.id ===
                        record.courseId
                );


            const student =
                database.users.find(
                    item =>
                        item.id ===
                        record.studentId
                );


            return `
                <div class="student-row">

                    <div class="student-details">

                        <strong>
                            ${
                                course
                                    ? escapeHTML(
                                        course.name
                                    )
                                    : "Unknown Course"
                            }
                        </strong>

                        <span>
                            ${
                                currentUser.role ===
                                "instructor"
                                    ? (
                                        student
                                            ? escapeHTML(
                                                student.name
                                            )
                                            : ""
                                    )
                                    : record.date
                            }
                        </span>

                    </div>

                    <div>

                        <span class="status ${
                            record.status
                        }">

                            ${
                                record.status ===
                                "present"
                                    ? "Present"
                                    : "Absent"
                            }

                        </span>

                    </div>

                </div>
            `;

        }).join("");


    container.innerHTML = rows;
}


/* =========================================================
   MODAL CLOSE
========================================================= */

document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const modalId =
                    button.dataset.close;

                document
                    .getElementById(
                        modalId
                    )
                    .classList.add(
                        "hidden"
                    );
            }
        );
    });


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );
                }
            }
        );
    });


/* =========================================================
   INITIAL START
========================================================= */

if (currentUser) {

    showApplication();

} else {

    authPage.classList.remove(
        "hidden"
    );

    appPage.classList.add(
        "hidden"
    );
}