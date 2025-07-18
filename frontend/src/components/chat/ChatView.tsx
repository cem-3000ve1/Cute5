import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MessagePanel from "./MessagePanel";
import UserListPanel from "./UserListPanel";
import { ChannelList } from "./ChannelList";
import { DMPanel } from "./DMPanel";
import { useGuildStore } from "../../stores/guildStore";

interface ChatViewProps {
  showUserList?: boolean;
  showMessagePanel?: boolean;
  showChannelList?: boolean;
}

export default function ChatView({
  showUserList = true,
  showMessagePanel = true,
  showChannelList = false,
}: ChatViewProps) {
  const params = useParams();
  const navigate = useNavigate();
  const { guild_id, channel_id, user_id, group_id } = params;
  const { getChannelsByGuildId, fetchChannels } = useGuildStore();

  // Determine chat type and context
  const chatType = guild_id
    ? "guild"
    : user_id
    ? "direct"
    : group_id
    ? "group"
    : "unknown";
  const guildId = guild_id || "";
  const channelId = channel_id || "";
  const chatId = guildId || user_id || group_id || "";

  // Auto-navigate to first channel if we're on a guild without a channel
  useEffect(() => {
    if (guild_id && !channel_id && showChannelList && guildId) {
      // First check if we already have channels for this guild
      const existingChannels = getChannelsByGuildId(guildId);

      if (existingChannels.length > 0) {
        const firstChannel = existingChannels[0];
        navigate(`/guild/${guild_id}/${firstChannel.id}`, { replace: true });
      } else {
        // Fetch channels if we don't have them
        fetchChannels(guildId)
          .then(() => {
            const guildChannels = getChannelsByGuildId(guildId);
            if (guildChannels.length > 0) {
              const firstChannel = guildChannels[0];
              navigate(`/guild/${guild_id}/${firstChannel.id}`, {
                replace: true,
              });
            }
          })
          .catch((error) => {
            console.error("Failed to fetch channels in ChatView:", error);
            // If we can't fetch channels, redirect to home
            navigate("/me", { replace: true });
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guild_id, channel_id, guildId, getChannelsByGuildId]);

  return (
    <div className="flex h-full bg-background">
      {/* DM Panel - Left (for direct and group chats) */}
      {(chatType === "direct" || chatType === "group") && (
        <div className="flex-shrink-0">
          <DMPanel />
        </div>
      )}

      {/* Channel List Panel - Left (for guild chats) */}
      {showChannelList && guild_id && (
        <div className="flex-shrink-0">
          <ChannelList guildId={guildId} />
        </div>
      )}

      {/* Message Panel - Center */}
      {showMessagePanel && (
        <div
          className={`flex-1 flex flex-col ${showUserList ? "border-r" : ""}`}
        >
          <MessagePanel
            chatType={chatType}
            chatId={chatId}
            channelId={channelId}
          />
        </div>
      )}

      {/* User List Panel - Right */}
      {showUserList && (
        <div className="w-64 flex-shrink-0">
          <UserListPanel
            chatType={chatType}
            chatId={chatId}
            channelId={channelId}
          />
        </div>
      )}
    </div>
  );
}
