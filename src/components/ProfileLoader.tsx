export default function ProfileLoader() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="#e5e7eb"
        strokeWidth="4"
        fill="none"
      />

      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="#3b82f6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="44 132"
        strokeDashoffset="0"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 32 32;360 32 32"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>

      <g fill="#6b7280">
        <circle cx="32" cy="24" r="8" />

        <path d="M32 36c-8 0-14 4-14 10v6h28v-6c0-6-6-10-14-10z" />
      </g>

      <g fill="#3b82f6" opacity="0.3">
        <circle cx="32" cy="24" r="8">
          <animate
            attributeName="opacity"
            values="0.1;0.5;0.1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <path d="M32 36c-8 0-14 4-14 10v6h28v-6c0-6-6-10-14-10z">
          <animate
            attributeName="opacity"
            values="0.1;0.5;0.1"
            dur="2s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </path>
      </g>
    </svg>
  );
}
