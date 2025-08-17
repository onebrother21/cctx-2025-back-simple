import Types from "../types";
import Models from "../models";

export class AnalyticsService {
  /**
   * Get peak and average viewers for a livestream
   */
  static async getViewershipStats(channelId: string) {
    const viewershipData = await Models.ViewerLog.aggregate([
      { $match: { channel: channelId } },
      {
        $group: {
          _id: "$channel",
          peakViewers: { $max: "$metadata.viewerCt" },
          avgViewers: { $avg: "$metadata.viewerCt" },
        },
      },
    ]);

    return viewershipData.length > 0 ? viewershipData[0] : { peakViewers: 0, avgViewers: 0 };
  }

  /**
   * Get total and per-user comment count
   */
  static async getCommentStats(channelId: string) {
    const commentData = await Models.Comment.aggregate([
      { $match: { channel: channelId } },
      {
        $group: {
          _id: "$user",
          commentCount: { $sum: 1 },
        },
      },
      { $sort: { commentCount: -1 } },
    ]);

    const totalComments = commentData.reduce((sum, user) => sum + user.commentCount, 0);

    return { totalComments, topCommenters: commentData };
  }

  /**
   * Get most common reactions and reaction frequency
   */
  static async getReactionStats(channelId: string) {
    const reactionData = await Models.Reaction.aggregate([
      { $match: { channel: channelId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { totalReactions: reactionData.length, reactionTrends: reactionData };
  }

  /**
   * Get artist-specific engagement (views, reactions, comments)
   */
  static async getArtistPerformance(artistId: string) {
    const artistChannels = await Models.Channel.find({ featuredArtists: artistId }).select("_id");
    if (artistChannels.length === 0) return null;
    const channelIds = artistChannels.map((c) => c._id);
    const engagementData = await Promise.all([
      Models.ViewerLog.aggregate([
        { $match: { channel: { $in: channelIds } } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$metadata.viewerCt" },
            avgViews: { $avg: "$metadata.viewerCt" },
          },
        },
      ]),
      Models.Comment.countDocuments({ channel: { $in: channelIds } }),
      Models.Reaction.countDocuments({ channel: { $in: channelIds } }),
    ]);
    return {
      totalViews: engagementData[0]?.[0]?.totalViews || 0,
      avgViews: engagementData[0]?.[0]?.avgViews || 0,
      totalComments: engagementData[1] || 0,
      totalReactions: engagementData[2] || 0,
    };
  }

  /**
   * Get audience engagement trends (returning vs. new viewers)
   */
  static async getAudienceInsights(channelId: string) {
    const viewerData = await Models.ViewerLog.aggregate([
      { $match: { channel: channelId } },
      {
        $group: {
          _id: "$user",
          visits: { $sum: 1 },
        },
      },
    ]);

    const newViewers = viewerData.filter((v) => v.visits === 1).length;
    const returningViewers = viewerData.length - newViewers;

    return { totalViewers: viewerData.length, newViewers, returningViewers };
  }
  static async logUserEngagement(customerId: string, channelId: string, activityType: string, metadata: any): Promise<void> {
    const logEntry = new Models.ViewerLog({
      user: customerId,
      channel: channelId,
      activityType,
      metadata,
      timestamp: new Date(),
    });
    await logEntry.save();
  }
  static async recommendChannels(customerId: string, limit: number = 5): Promise<Types.IChannel[]> {
    // Fetch user’s recent engagement and preferred genres
    const recentEngagements = await Models.ViewerLog.find({ user: customerId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('channel');
    const preferredGenres = recentEngagements.map(log => log.channel.genre);
    // Fetch trending channels that match user interests
    const recommendedChannels = await Models.Channel.aggregate([
      { $match: { genre: { $in: preferredGenres } } },
      { $sort: { viewerCt: -1, startTime: -1 } },
      { $limit: limit },
    ]);
    return recommendedChannels;
  }
}