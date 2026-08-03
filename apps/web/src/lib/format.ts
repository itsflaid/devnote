export function timeAgo(dateStr: Date | string) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return "baru saja"
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`
    if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu yang lalu`
    return `${Math.floor(diff / 2592000)} bulan yang lalu`
}

export function getInitials(name: string) {
    const words = name.trim().split(" ")
    if (words.length === 1) return words[0][0].toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}