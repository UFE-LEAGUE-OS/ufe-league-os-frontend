from pathlib import Path
import subprocess

root = Path.cwd()

# 1) Revert fantasy UI pages back to the current branch/original checked-out design.
fantasy_paths = [
    "src/components/FantasyLeagues.css",
    "src/components/FantasyLeagues.tsx",
    "src/pages/JoinFantasy.tsx",
    "src/pages/fantasy",
    "src/styles/pages/JoinFantasy.css",
]

subprocess.run(["git", "checkout", "--", *fantasy_paths], check=True)

# Remove temporary fantasy API service only if it is untracked.
fantasy_service = "src/services/fantasyService.ts"
service_path = root / fantasy_service

is_tracked = (
    subprocess.run(
        ["git", "ls-files", "--error-unmatch", fantasy_service],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode
    == 0
)

if service_path.exists() and not is_tracked:
    service_path.unlink()
elif service_path.exists() and is_tracked:
    subprocess.run(["git", "checkout", "--", fantasy_service], check=True)

# 2) Fix the TypeScript error caused by adding subscriptionId to ClubMembership.
page_path = root / "src/pages/memberships/MyMembershipsPage.tsx"

if not page_path.exists():
    raise SystemExit("Could not find src/pages/memberships/MyMembershipsPage.tsx")

page = page_path.read_text()

if '    subscriptionId: number;\n' in page and '    subscriptionId: 0,\n' not in page:
    page = page.replace(
        '    id: "empty-membership",\n    clubName: "No active membership",\n',
        '    id: "empty-membership",\n    subscriptionId: 0,\n    clubName: "No active membership",\n',
    )

# Safety cleanup in case the previous replace accidentally duplicated this line.
page = page.replace(
    '    if (normalizedTier === "GOLD" || normalizedTier === "PLATINUM") {\n        return [\n        return [\n',
    '    if (normalizedTier === "GOLD" || normalizedTier === "PLATINUM") {\n        return [\n',
)

page_path.write_text(page)

# 3) Safety cleanup for payment-processing import path.
processing_path = root / "src/pages/memberships/MembershipPaymentProcessingPage.tsx"

if processing_path.exists():
    processing = processing_path.read_text()
    processing = processing.replace(
        'import { verifyMembershipPayment } from "././services/membershipCheckoutService";',
        'import { verifyMembershipPayment } from "../../services/membershipCheckoutService";',
    )
    processing_path.write_text(processing)

print("Fantasy pages restored and membership TypeScript cleanup applied.")
