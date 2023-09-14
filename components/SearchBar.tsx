import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // You can handle the search query here.
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="flex items-center border-2 border-sky-500 rounded-md">
      <input
        type="text"
        className="w-full p-2 rounded-l-md"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded-r-md flex items-center justify-center"
      >
        <FiSearch />
      </button>
    </div>
  );
};

export default SearchBar;
