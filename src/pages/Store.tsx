import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Music, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SongCard from "@/components/music/SongCard";
import PaymentModal from "@/components/music/PaymentModal";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Song } from "@/lib/api";

export default function Store() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [buyingSong, setBuyingSong] = useState<Song | null>(null);

    useEffect(() => {
        api.getSongs()
            .then(setSongs)
            .catch(() => setSongs([]))
            .finally(() => setLoading(false));
    }, []);

    const genres = [...new Set(songs.map((s) => s.genre))];

    const filtered = songs.filter((s) => {
        const matchSearch =
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.artist.toLowerCase().includes(search.toLowerCase());
        const matchGenre = !selectedGenre || s.genre === selectedGenre;
        return matchSearch && matchGenre;
    });

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-5xl mx-auto px-6 md:px-12 py-6 flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Music className="w-7 h-7 text-primary" />
                            Music Store
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Stream previews. Buy individual tracks for UGX 3,000 each.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search songs..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/50 border border-border text-sm focus:border-primary/50 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Genre filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedGenre(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                !selectedGenre
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All
                        </button>
                        {genres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() =>
                                    setSelectedGenre(
                                        genre === selectedGenre ? null : genre
                                    )
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    genre === selectedGenre
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Song Grid */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-96 rounded-2xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Music className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            {songs.length === 0
                                ? "No songs available yet. Check back soon!"
                                : "No songs match your search."}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filtered.map((song, i) => (
                            <SongCard
                                key={song.id}
                                song={song}
                                index={i}
                                onBuy={setBuyingSong}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Payment Modal */}
            {buyingSong && (
                <PaymentModal
                    song={buyingSong}
                    onClose={() => setBuyingSong(null)}
                />
            )}
        </div>
    );
}
