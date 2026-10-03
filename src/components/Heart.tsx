type Props = { size?: number; className?: string; color?: string }

/** A soft, rounded heart. */
export function Heart({ size = 16, className, color = 'currentColor' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill={color}
        d="M12 20.6c-.3 0-.6-.1-.8-.3C8.4 18 3 13.9 3 9.3 3 6.6 5.1 4.5 7.7 4.5c1.7 0 3.2.9 4.3 2.3 1.1-1.4 2.6-2.3 4.3-2.3 2.6 0 4.7 2.1 4.7 4.8 0 4.6-5.4 8.7-8.2 11-.2.2-.5.3-.8.3z"
      />
    </svg>
  )
}
