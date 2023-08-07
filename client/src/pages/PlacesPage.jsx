import { Link, useParams } from "react-router-dom";

export default function PlacesPage() {
  const { action } = useParams();

  return (
    <div>
      {action !== "new" && (
        <div>
          <Link
            className="inline-flex gap-0.5 items-center bg-primary text-white px-3 py-2 rounded-full"
            to={"/accounts/places/new"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              className="stroke-slate-200 fill-none group-active:fill-slate-600 duration-200 mr-2"
            >
              <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                stroke-width="1.5"
              ></path>
              <path d="M8 12H16" strokeWidth="1.5"></path>
              <path d="M12 16V8" strokeWidth="1.5"></path>
            </svg>
            Add new place
          </Link>
        </div>
      )}
      {action === "new" && (
        <div>
          <form>
            <input type="text" placeholder="title" />
          </form>
        </div>
      )}
      <div className="text-center">Places</div>
    </div>
  );
}
