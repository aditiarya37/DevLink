import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PostItem from "../components/PostItem";
import EditPostModal from "../components/EditPostModal";
import {
  FaGithub,
  FaLinkedin,
  FaLink,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";

const formatMonthYear = (dateString) => {
  if (!dateString) return "Present";
  const [year, month] = dateString.split("-");
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

const ProfilePage = () => {
  const { username: routeUsername } = useParams();
  const {
    user: currentUser,
    isAuthenticated,
    loading: authLoading,
    token,
  } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const isOwnProfile =
    isAuthenticated &&
    currentUser &&
    currentUser.username === routeUsername?.toLowerCase();

  const fetchProfileData = useCallback(async () => {
    if (!routeUsername) {
      setLoadingProfile(false);
      setLoadingPosts(false);
      return;
    }
    setLoadingProfile(true);
    setLoadingPosts(true);
    setError("");
    try {
      const profileRes = await axios.get(
        `${API_BASE_URL}/users/profile/${routeUsername.toLowerCase()}`,
      );
      const fetchedUser = profileRes.data;
      setProfileUser(fetchedUser);
      if (fetchedUser?._id) {
        const postsRes = await axios.get(
          `${API_BASE_URL}/posts/user/${fetchedUser._id}`,
        );
        setUserPosts(postsRes.data);
        if (
          currentUser &&
          fetchedUser._id !== currentUser._id &&
          Array.isArray(currentUser.following)
        ) {
          setIsFollowing(
            currentUser.following.some((id) => id === fetchedUser._id),
          );
        } else {
          setIsFollowing(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
      setProfileUser(null);
      setUserPosts([]);
    } finally {
      setLoadingProfile(false);
      setLoadingPosts(false);
    }
  }, [routeUsername, API_BASE_URL, currentUser]);

  useEffect(() => {
    if (!authLoading) fetchProfileData();
  }, [authLoading, fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!profileUser?._id || !token || isOwnProfile) return;
    setFollowLoading(true);
    const action = isFollowing ? "unfollow" : "follow";
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `${API_BASE_URL}/users/${profileUser._id}/${action}`,
        {},
        config,
      );
      setIsFollowing(!isFollowing);
    } catch (err) {
      alert(`Failed to ${action} user.`);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleteOnProfile = async (postId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setUserPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  if (loadingProfile || authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "2px solid var(--border-subtle)",
            borderTop: "2px solid var(--accent-green)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <p style={{ color: "#f87171", marginBottom: "1rem" }}>{error}</p>
        <Link
          to="/"
          style={{ color: "var(--accent-green)", textDecoration: "none" }}
        >
          ← Go Home
        </Link>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          color: "var(--text-muted)",
        }}
      >
        Profile not found.
      </div>
    );
  }

  const profileInitial = profileUser.username
    ? profileUser.username.charAt(0).toUpperCase()
    : "P";
  const profilePic =
    profileUser.profilePicture ||
    `https://ui-avatars.com/api/?name=${profileInitial}&background=1c1c21&color=b9f43d&size=150&font-size=0.4&length=1`;

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      {/* Profile Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          marginBottom: "1.5rem",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(185,244,61,0.05) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            position: "relative",
          }}
        >
          {/* Top row: avatar + info */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <img
              src={profilePic}
              alt={profileUser.displayName || profileUser.username}
              className="avatar"
              style={{
                width: "96px",
                height: "96px",
                border: "2px solid rgba(185,244,61,0.3)",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.75rem",
                  color: "var(--text-primary)",
                  marginBottom: "0.2rem",
                  letterSpacing: "-0.03em",
                }}
              >
                {profileUser.displayName || profileUser.username}
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-dim)",
                  marginBottom: "0.5rem",
                }}
              >
                @{profileUser.username.toLowerCase()}
              </p>
              {profileUser.location && (
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  <FaMapMarkerAlt
                    style={{
                      color: "var(--accent-green)",
                      width: "12px",
                      flexShrink: 0,
                    }}
                  />
                  {profileUser.location}
                </p>
              )}
              {profileUser.bio && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    marginBottom: "0.75rem",
                  }}
                >
                  {profileUser.bio}
                </p>
              )}
              {/* Links */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {profileUser.links?.github && (
                  <SocialLink
                    href={profileUser.links.github}
                    icon={<FaGithub />}
                    label="GitHub"
                  />
                )}
                {profileUser.links?.linkedin && (
                  <SocialLink
                    href={profileUser.links.linkedin}
                    icon={<FaLinkedin />}
                    label="LinkedIn"
                  />
                )}
                {profileUser.links?.website && (
                  <SocialLink
                    href={profileUser.links.website}
                    icon={<FaLink />}
                    label="Website"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Stats + Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Stat value={profileUser.followerCount || 0} label="Followers" />
              <Stat value={profileUser.followingCount || 0} label="Following" />
            </div>
            <div>
              {isAuthenticated && !isOwnProfile && profileUser && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading || authLoading}
                  className={isFollowing ? "btn-secondary" : "btn-primary"}
                  style={{ padding: "0.5rem 1.5rem" }}
                >
                  {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="btn-secondary"
                  style={{
                    padding: "0.5rem 1.25rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {profileUser.skills?.length > 0 && (
        <Section title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {profileUser.skills.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {profileUser.experience?.length > 0 && (
        <Section
          title="Work Experience"
          icon={
            <FaBriefcase
              style={{ color: "var(--accent-green)", marginRight: "0.5rem" }}
            />
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {profileUser.experience.map((exp) => (
              <TimelineItem
                key={exp._id}
                title={exp.title}
                subtitle={exp.company}
                dates={`${formatMonthYear(exp.startDate)} — ${formatMonthYear(exp.endDate)}`}
                description={exp.description}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {profileUser.education?.length > 0 && (
        <Section
          title="Education"
          icon={
            <FaGraduationCap
              style={{ color: "var(--accent-green)", marginRight: "0.5rem" }}
            />
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {profileUser.education.map((edu) => (
              <TimelineItem
                key={edu._id}
                title={edu.institution}
                subtitle={`${edu.degree}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}`}
                badge={edu.grade ? `Grade: ${edu.grade}` : null}
                dates={`${formatMonthYear(edu.startDate)} — ${formatMonthYear(edu.endDate)}`}
                description={edu.description}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Posts */}
      <div style={{ marginTop: "1rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--text-primary)",
            marginBottom: "1.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          Posts by {profileUser.displayName || profileUser.username}
        </h2>
        {loadingPosts && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            Loading posts...
          </div>
        )}
        {!loadingPosts && userPosts.length === 0 && (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "2.5rem",
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: "0.875rem",
              fontStyle: "italic",
            }}
          >
            No posts yet.
          </div>
        )}
        {userPosts.length > 0 &&
          userPosts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              onEdit={setEditingPost}
              onDelete={handlePostDeleteOnProfile}
            />
          ))}
      </div>

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={(updated) =>
            setUserPosts((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p)),
            )
          }
        />
      )}
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-card)",
      borderRadius: "var(--radius-lg)",
      padding: "1.5rem",
      marginBottom: "1rem",
      boxShadow: "var(--shadow-card)",
    }}
  >
    <h3
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.95rem",
        color: "var(--text-primary)",
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        letterSpacing: "-0.01em",
      }}
    >
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const Stat = ({ value, label }) => (
  <div>
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "1.3rem",
        color: "var(--text-primary)",
      }}
    >
      {value}
    </span>{" "}
    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
      {label}
    </span>
  </div>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-ghost"
    style={{
      fontSize: "0.78rem",
      padding: "0.25rem 0.65rem",
      textDecoration: "none",
    }}
  >
    {icon} {label}
  </a>
);

const TimelineItem = ({ title, subtitle, badge, dates, description }) => (
  <div
    style={{
      paddingLeft: "1rem",
      borderLeft: "1px solid var(--border-subtle)",
      position: "relative",
    }}
  >
    <div className="timeline-dot" />
    <h4
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "0.95rem",
        color: "var(--text-primary)",
        marginBottom: "0.2rem",
      }}
    >
      {title}
    </h4>
    {subtitle && (
      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          marginBottom: "0.2rem",
        }}
      >
        {subtitle}
      </p>
    )}
    {badge && (
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--accent-green)",
          fontWeight: 600,
          marginBottom: "0.2rem",
        }}
      >
        {badge}
      </p>
    )}
    <p
      style={{
        fontSize: "0.75rem",
        color: "var(--text-dim)",
        marginBottom: description ? "0.5rem" : 0,
      }}
    >
      {dates}
    </p>
    {description && (
      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          whiteSpace: "pre-wrap",
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>
    )}
  </div>
);

export default ProfilePage;
