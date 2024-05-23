import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <nav className="mt-8">
          <ul>
            <li className="mb-4">
              <Link href="/admin/users">
                <a className="text-lg">Users</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
