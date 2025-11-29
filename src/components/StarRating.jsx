export default function StarRating({ rating, max = 5 }) {
    return (
        <div className="flex text-yellow-400">
            {[...Array(max)].map((_, i) => (
                <span key={i}>{i < rating ? '★' : '☆'}</span>
            ))}
        </div>
    );
}
