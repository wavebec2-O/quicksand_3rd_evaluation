import { Sequelize, where } from "sequelize";
import {
  Course,
  CourseModel,
  CourseSectionModel,
  InstructorCourseModel,
  ProfileModel,
  SectionVideoModel,
  StudentCourseModel,
  UserModel,
} from "../models";
import { v4 as uuidV4 } from "uuid";
import notificationService from "../lib/notification";

class CourseService {
  async createCourse(instructorId: string, course: any, tags: string[]) {
    let courseBody = course;
    if (typeof courseBody?.price === "number") {
      courseBody.price = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(courseBody.price);
    }
    console.log(courseBody.price);

    const newCourse = await CourseModel.create({
      id: uuidV4(),
      ...course,
      instructorId,
    });
    if (newCourse === null) throw new Error(`Course not created`);

    await InstructorCourseModel.create({
      instructorId,
      courseId: newCourse.id,
      id: uuidV4(),
    });
    // Add logic to handle tags if required

    await notificationService.sendMessage(
      `Hey users, a new course ${newCourse.title} has been added! Do check it out`,
      "+918073970294"
    );
    return newCourse;
  }
  async getAllCourses() {
    const courses = await CourseModel.findAll();

    const modifiedCourses: any[] = courses.map((course) => ({
      courseId: course.id,
      title: course.title,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      bestseller: course.bestSeller,
      imgSrc: course.imgUrl,
      description: course.description,
      instructorId: course.instructorId,
    }));

    modifiedCourses.forEach(async (course) => {
      const instructorProfile = await ProfileModel.findOne({
        where: { userId: course.instructorId },
      });
      if (instructorProfile === null) return;

      course.instructor = instructorProfile.firstName;
    });

    return modifiedCourses;
  }

  async getCourseById(id: string) {
    const course = await CourseModel.findByPk(id);
    if (course === null) return false;

    const modifiedCourse: any = {
      courseId: course.id,
      title: course.title,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      bestseller: course.bestSeller,
      imgSrc: course.imgUrl,
      description: course.description,
      instructorId: course.instructorId,
    };

    const instructorProfile = await ProfileModel.findOne({
      where: { userId: course.instructorId },
    });

    modifiedCourse.instructor = instructorProfile?.firstName;

    return modifiedCourse;
  }

  async getStudentCourses(studentId: string) {
    const enrolledCourses = await StudentCourseModel.findAll({
      where: { studentId },
    });

    const courses: any[] = [];
    for (let enrolledCourse of enrolledCourses) {
      let eCourse = await CourseModel.findByPk(enrolledCourse.courseId);
      courses.push(eCourse);
    }

    const modifiedCourses: any[] = courses.map((course) => ({
      courseId: course.id,
      title: course.title,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      bestseller: course.bestSeller,
      imgSrc: course.imgUrl,
      description: course.description,
      instructorId: course.instructorId,
    }));

    modifiedCourses.forEach(async (course) => {
      const instructorProfile = await ProfileModel.findOne({
        where: { userId: course.instructorId },
      });
      if (instructorProfile === null) return;

      course.instructor = instructorProfile.firstName;
    });

    return modifiedCourses;
  }

  async getInstructorCourses(instructorId: string) {
    const instructorCourses: any = await InstructorCourseModel.findAll({
      where: { instructorId },
    });

    const courses: any[] = [];
    for (let course of instructorCourses) {
      let eCourse = await CourseModel.findByPk(course.courseId);
      courses.push(eCourse);
    }

    const modifiedCourses: any[] = courses.map((course) => ({
      courseId: course.id,
      title: course.title,
      rating: course.rating,
      reviews: course.reviews,
      price: course.price,
      bestseller: course.bestSeller,
      imgSrc: course.imgUrl,
      description: course.description,
      instructorId: course.instructorId,
    }));

    modifiedCourses.forEach(async (course) => {
      const instructorProfile = await ProfileModel.findOne({
        where: { userId: course.instructorId },
      });
      if (instructorProfile === null) return;

      course.instructor = instructorProfile.firstName;
    });

    return modifiedCourses;
  }

  async addCourseSections(courseId: string, title: string) {
    return await CourseSectionModel.create({ courseId, title });
  }

  async getCourseSections(courseId: string) {
    const sections = await CourseSectionModel.findAll({ where: { courseId } });
    return sections;
  }

  async getCourseSectionVideos(videoId: string) {}

  async addCourseSectionVideo(
    courseId: string,
    sectionId: string,
    videoTitle: string,
    videoUrl: string
  ) {
    // Check if the section belongs to the course
    const section = await CourseSectionModel.findOne({
      where: {
        id: sectionId,
        courseId,
      },
    });

    if (!section) {
      throw new Error("Section does not belong to the specified course");
    }

    return await SectionVideoModel.create({
      sectionId,
      videoUrl,
      title: videoTitle,
    });
  }
  async enrollStudent(studentId: string, courseId: string) {
    const enrolled = await StudentCourseModel.findOne({
      where: { courseId, studentId },
    });

    if (enrolled) return null;

    const profile = await ProfileModel.findOne({
      where: { userId: studentId },
    });

    if (profile !== null) {
      await notificationService.sendMessage(
        `Congratulations ${profile.firstName}! You have been registered to the course successfully`,
        "+918073970294"
      );
    }

    return await StudentCourseModel.create({
      id: uuidV4(),
      studentId,
      courseId,
    });
  }
}

export default new CourseService();
