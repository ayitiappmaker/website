export default function NoProfile() {
  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#9ca3af">
        <circle cx="12" cy="8" r="4" />

        <path d="M12 14c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
      </g>

      <circle
        cx="12"
        cy="12"
        r="11"
        fill="#ef4444"
        fill-opacity="0.1"
        stroke="#ef4444"
        stroke-width="2"
      />

      <g stroke="#ef4444" stroke-width="2" stroke-linecap="round">
        <path d="M8 8l8 8" />
        <path d="M16 8l-8 8" />
      </g>
    </svg>
  );
}
