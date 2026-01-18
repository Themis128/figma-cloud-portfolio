/** @jsxImportSource react */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	PageSkeleton,
	Skeleton,
	SkeletonAvatar,
	SkeletonButton,
	SkeletonCard,
	SkeletonText,
} from "../client/components/Skeleton";

describe("Skeleton Components", () => {
	describe("Skeleton", () => {
		it("should render with default props", () => {
			render(<Skeleton />);
			const skeleton = screen.getByTestId("skeleton");
			expect(skeleton).toBeInTheDocument();
			expect(skeleton).toHaveClass("animate-pulse");
		});

		it("should apply custom className", () => {
			render(<Skeleton className="custom-class" />);
			const skeleton = screen.getByTestId("skeleton");
			expect(skeleton).toHaveClass("custom-class");
		});
	});

	describe("SkeletonText", () => {
		it("should render single line", () => {
			render(<SkeletonText />);
			const skeleton = screen.getByTestId("skeleton");
			expect(skeleton).toHaveClass("h-4", "w-full");
		});

		it("should render multiple lines", () => {
			render(<SkeletonText lines={3} />);
			const container = screen.getByTestId("skeleton-text");
			const skeletons = screen.getAllByTestId("skeleton");
			expect(skeletons).toHaveLength(3);
			expect(skeletons[0]).toHaveClass("h-4", "w-full");
			expect(skeletons[2]).toHaveClass("h-4", "w-3/4"); // Last line shorter
		});

		it("should apply custom className", () => {
			render(<SkeletonText className="custom-text" />);
			const skeleton = screen.getByTestId("skeleton");
			expect(skeleton).toHaveClass("custom-text");
		});
	});

	describe("SkeletonCard", () => {
		it("should render card skeleton", () => {
			render(<SkeletonCard />);
			const card = screen.getByTestId("skeleton-card");
			expect(card).toHaveClass("rounded-lg", "border", "p-6");

			// Should contain skeleton text elements
			const skeletons = screen.getAllByTestId("skeleton");
			expect(skeletons.length).toBeGreaterThan(1);
		});

		it("should apply custom className", () => {
			render(<SkeletonCard className="custom-card" />);
			const card = screen.getByTestId("skeleton-card");
			expect(card).toHaveClass("custom-card");
		});
	});

	describe("SkeletonAvatar", () => {
		it("should render small avatar", () => {
			render(<SkeletonAvatar size="sm" />);
			const avatar = screen.getByTestId("skeleton");
			expect(avatar).toHaveClass("rounded-full", "h-8", "w-8");
		});

		it("should render medium avatar", () => {
			render(<SkeletonAvatar size="md" />);
			const avatar = screen.getByTestId("skeleton");
			expect(avatar).toHaveClass("rounded-full", "h-12", "w-12");
		});

		it("should render large avatar", () => {
			render(<SkeletonAvatar size="lg" />);
			const avatar = screen.getByTestId("skeleton");
			expect(avatar).toHaveClass("rounded-full", "h-16", "w-16");
		});

		it("should apply custom className", () => {
			render(<SkeletonAvatar className="custom-avatar" />);
			const avatar = screen.getByTestId("skeleton");
			expect(avatar).toHaveClass("custom-avatar");
		});
	});

	describe("SkeletonButton", () => {
		it("should render button skeleton", () => {
			render(<SkeletonButton />);
			const button = screen.getByTestId("skeleton");
			expect(button).toHaveClass("h-10", "w-24");
		});

		it("should apply custom className", () => {
			render(<SkeletonButton className="custom-button" />);
			const button = screen.getByTestId("skeleton");
			expect(button).toHaveClass("custom-button");
		});
	});

	describe("PageSkeleton", () => {
		it("should render page skeleton", () => {
			render(<PageSkeleton />);
			const page = screen.getByTestId("page-skeleton");
			expect(page).toHaveClass("min-h-screen");

			// Should contain multiple skeleton elements
			const skeletons = screen.getAllByTestId("skeleton");
			expect(skeletons.length).toBeGreaterThan(5);
		});
	});
});
