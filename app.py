from flask import Flask, render_template, request

app = Flask(__name__)

YOUTUBE_VIDEO_ID = "iYmvCUonukw"

@app.route("/")
def home():
    return render_template("index.html", video_id=YOUTUBE_VIDEO_ID)

@app.route("/viewer/<image_name>")
def viewer(image_name):
    return render_template("viewer.html", image_name=image_name)

@app.route("/referencias")
def referencias():
    return render_template("referencias.html")


if __name__ == "__main__":
    app.run(debug=True)
