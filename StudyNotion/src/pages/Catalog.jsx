import React, { useEffect, useState } from "react";
import Footer from "../components/common/Footer";
import { useParams } from "react-router-dom";
import { apiConnector } from "../services/apiconnector";
import { categories } from "../services/apis";
import { getCatalogaPageData } from "../services/operations/pageAndComponentData";
import Course_Card from "../components/core/Catalog/Course_card";
import CourseSlider from "../components/core/Catalog/CourseSlider";
import { useSelector } from "react-redux";
import Error from "./Error";

const Catalog = () => {
  const { loading } = useSelector((state) => state.profile);
  const { catalogName } = useParams();
  const [active, setActive] = useState(1);
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");

  // Fetch all categories and set categoryId
  useEffect(() => {
    const getCategories = async () => {
      try {
        console.log("Fetching all categories...");
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        console.log("All categories response:", res?.data?.data);

        const category = res?.data?.data?.find(
          (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
        );

        console.log("Matched category:", category);

        if (category) setCategoryId(category._id);
      } catch (err) {
        console.log("Error fetching categories:", err);
      }
    };
    getCategories();
  }, [catalogName]);

  // Fetch catalog page data for selected category
  useEffect(() => {
    const getCategoryDetails = async () => {
      try {
        console.log("Fetching catalog page data for categoryId:", categoryId);
        const res = await getCatalogaPageData(categoryId);
        console.log("Catalog page data response:", res);
        setCatalogPageData(res);
      } catch (error) {
        console.log("Error fetching catalog page data:", error);
      }
    };
    if (categoryId) getCategoryDetails();
  }, [categoryId]);

  console.log("Loading state:", loading);
  console.log("Catalog page data state:", catalogPageData);
  console.log("Active tab:", active);

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!loading && !catalogPageData.success) {
    console.log("Catalog page data unsuccessful:", catalogPageData);
    return <Error />;
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-richblack-800 px-4">
        <div className="mx-auto flex min-h-[320px] max-w-7xl flex-col justify-center gap-4">
          <p className="text-sm text-white/70">
            Home / Catalog /{" "}
            <span className="text-yellow-500">
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </p>
          <p className="text-3xl lg:text-4xl text-white font-semibold">
            {catalogPageData?.data?.selectedCategory?.name}
          </p>
          <p className="max-w-full lg:max-w-3xl text-white/80">
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* Section 1: Courses to get you started */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="text-xl lg:text-2xl font-semibold mb-4 text-white">
          Courses to get you started
        </div>
        <div className="flex border-b border-white/20 text-sm mb-4">
          <p
            className={`px-4 py-2 ${
              active === 1
                ? "border-b-2 border-yellow-500 text-yellow-500"
                : "text-white/70"
            } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>
          <p
            className={`px-4 py-2 ${
              active === 2
                ? "border-b-2 border-yellow-500 text-yellow-500"
                : "text-white/70"
            } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        {console.log("here")}
        <CourseSlider
          Courses={catalogPageData?.data?.selectedCategory?.courses}
        />
        {console.log(
          "Selected category courses:",
          catalogPageData?.data?.selectedCategory?.courses
        )}
      </div>

      {/* Section 2: Top courses in different category */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="text-xl lg:text-2xl font-semibold mb-4 text-white">
          Top courses in {catalogPageData?.data?.differentCategory?.name}
        </div>
        <div className="py-4">
          <CourseSlider
            Courses={catalogPageData?.data?.differentCategory?.courses}
          />
          {console.log(
            "Different category courses:",
            catalogPageData?.data?.differentCategory?.courses
          )}
        </div>
      </div>

      {/* Section 3: Frequently Bought */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="text-xl lg:text-2xl font-semibold mb-4 text-white">
          Frequently Bought
        </div>
        <div className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogPageData?.data?.mostSellingCourses
              ?.slice(0, 6)
              .map((course, i) => {
                console.log("Most selling course:", course);
                return (
                  <Course_Card course={course} key={i} Height="h-[400px]" />
                );
              })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Catalog;
