namespace JustRunnerChat.Data.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        UserId = c.Int(nullable: false, identity: true),
                        Username = c.String(nullable: false),
                        Nickname = c.String(),
                        AuthCode = c.String(),
                        SessionKey = c.String(),
                    })
                .PrimaryKey(t => t.UserId);
            
            CreateTable(
                "dbo.Channels",
                c => new
                    {
                        ChannelId = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        Password = c.String(),
                    })
                .PrimaryKey(t => t.ChannelId);
            
            CreateTable(
                "dbo.Messages",
                c => new
                    {
                        MessageId = c.Int(nullable: false, identity: true),
                        Author = c.String(nullable: false),
                        Content = c.String(nullable: false),
                        DateTime = c.DateTime(nullable: false),
                        Channel_ChannelId = c.Int(),
                    })
                .PrimaryKey(t => t.MessageId)
                .ForeignKey("dbo.Channels", t => t.Channel_ChannelId)
                .Index(t => t.Channel_ChannelId);
            
            CreateTable(
                "dbo.ChannelUsers",
                c => new
                    {
                        Channel_ChannelId = c.Int(nullable: false),
                        User_UserId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.Channel_ChannelId, t.User_UserId })
                .ForeignKey("dbo.Channels", t => t.Channel_ChannelId, cascadeDelete: true)
                .ForeignKey("dbo.Users", t => t.User_UserId, cascadeDelete: true)
                .Index(t => t.Channel_ChannelId)
                .Index(t => t.User_UserId);
            
        }
        
        public override void Down()
        {
            DropIndex("dbo.ChannelUsers", new[] { "User_UserId" });
            DropIndex("dbo.ChannelUsers", new[] { "Channel_ChannelId" });
            DropIndex("dbo.Messages", new[] { "Channel_ChannelId" });
            DropForeignKey("dbo.ChannelUsers", "User_UserId", "dbo.Users");
            DropForeignKey("dbo.ChannelUsers", "Channel_ChannelId", "dbo.Channels");
            DropForeignKey("dbo.Messages", "Channel_ChannelId", "dbo.Channels");
            DropTable("dbo.ChannelUsers");
            DropTable("dbo.Messages");
            DropTable("dbo.Channels");
            DropTable("dbo.Users");
        }
    }
}
