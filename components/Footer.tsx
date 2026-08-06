export default function Footer() {
    return (
        <footer className="bg-background py-4 border-t border-gray-800/20">
            <div className="flex items-center justify-center flex-col gap-2">
                <p className="text-primary text-sx">&copy; {new Date().getFullYear()} Природничо-науковий ліцей №145. Всі права захищені.</p>
                <p className="text-gray-400 text-sm">Розроблено GhostStudio</p>
                {/* <a href="https://ghoststudio.online" className="text-blue-500 hover:underline">GhostStudio</a> */}
            </div>
        </footer>
    )
}