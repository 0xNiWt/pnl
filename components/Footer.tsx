export default function Footer() {
    return (
        <footer className="bg-background px-4 py-4 border-t border-gray-800/20">
            <div className="flex items-center justify-center flex-col gap-2">
                <p className="text-primary text-sx">&copy; {new Date().getFullYear()} Природничо-науковий ліцей №145. Всі права захищені.</p>
                <p className="text-gray-400 text-sm">Розроблено <a href="https://ghoststudio.online" target="_blank" rel="noopener noreferrer" className="transition-all hover:text-primary">GhostStudio</a></p>
            </div>
        </footer>
    )
}