import mongoose from "mongoose";
import PostMessage from "../model/postMessage.js";

describe("Post Model Test", () => {
  
  // 1. Test creating a valid post
  it("should create a post successfully", () => {
    const validPost = {
      title: "My First Blog",
      message: "This is the content of the blog",
      name: "John Doe",
      creator: "12345",
      tags: ["blog", "test"],
      selectedFile: "imageString",
    };
    const post = new PostMessage(validPost);
    
    expect(post.title).toBe("My First Blog");
    expect(post.message).toBe("This is the content of the blog");
    expect(post.tags).toEqual(["blog", "test"]);
    expect(post.likes).toEqual([]); // Should be empty by default
  });

  // 2. Test default values
  it("should have default createdAt date", () => {
    const post = new PostMessage({
      title: "Test Date",
      message: "Content",
      name: "Jane",
      creator: "67890"
    });
    
    expect(post.createdAt).toBeDefined();
    expect(post.comments).toEqual([]);
  });
});