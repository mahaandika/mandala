export default function AppLogo() {
    return (
        <>
            <div className="flex items-center justify-center rounded-md">
                <img
                    src="/images/mandala_black.png"
                    className="h-12 fill-current text-white dark:text-black"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold"></span>
            </div>
        </>
    );
}
