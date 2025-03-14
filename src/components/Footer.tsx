export default function Footer() {
    return (
        <footer className=" text-white text-center py-2 px-6 mt-auto w-full">
            <div className="flex flex-col items-center justify-center">
                <p className="text-sm">&copy; {new Date().getFullYear()} John Hagens. All Rights Reserved.</p>

                {/* Social/contact links with hover effect */}
                <div className="mt-3 flex space-x-4">
                    <a
                        href="https://github.com/JonJon50"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-green-500 transition-all duration-300"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/john-hagens-55b15212a/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-green-500 transition-all duration-300"
                    >
                        LinkedIn
                    </a>
                    <a
                        href="mailto:ginuwine104@gmail.com"
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-green-500 transition-all duration-300"
                    >
                        Email
                    </a>
                </div>
            </div>
        </footer>
    );
}
