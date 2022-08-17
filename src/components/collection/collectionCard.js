import { Images } from "../../data/images";

const CollectionCard = ({ imgSrc, id }) => {
  return (
    <div className="mx-2 mb-5">
      <div className="flex justify-center items-center">
        <img
          src={imgSrc ? imgSrc : Images.unknown}
          alt="card"
          className="rounded-20%"
        />
      </div>
      <div className="text-sm font-poppins font-bold text-center mt-4">
        {id}
      </div>
    </div>
  );
};

export default CollectionCard;
